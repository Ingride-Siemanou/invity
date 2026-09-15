import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

type ResponseRouteProps = {
  params: Promise<{
    token: string;
  }>;
};

type SubmittedAnswer = {
  questionId: number;
  value: string;
};

export async function POST(
  request: Request,
  { params }: ResponseRouteProps
) {
  try {
    const { token } = await params;

    // 1. Rechercher l'invité grâce à son lien unique
    const guest = await db.orm.public.Guest
      .where({ token })
      .first();

    if (!guest) {
      return NextResponse.json(
        { error: "Invitation introuvable." },
        { status: 404 }
      );
    }

    // 2. Charger l'événement pour connaître ses règles
    const event = await db.orm.public.Event
      .where({ id: guest.eventId })
      .first();

    if (!event) {
      return NextResponse.json(
        { error: "Événement introuvable." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const status = body.status;

    // 3. Vérifier la réponse de présence
    if (
      status !== "accepted" &&
      status !== "declined" &&
      status !== "maybe"
    ) {
      return NextResponse.json(
        { error: "Réponse invalide." },
        { status: 400 }
      );
    }

    // 4. Vérifier le nombre d'accompagnants
    let companionCount = 0;

    if (status === "accepted") {
      companionCount = Number(body.companionCount ?? 0);

      if (
        !Number.isInteger(companionCount) ||
        companionCount < 0 ||
        companionCount > guest.maxCompanions
      ) {
        return NextResponse.json(
          {
            error: `Le nombre d’accompagnants doit être compris entre 0 et ${guest.maxCompanions}.`,
          },
          { status: 400 }
        );
      }
    }

    // 5. Vérifier les informations concernant les enfants
    let childrenCount = 0;
    let childrenAges: string | null = null;

    const childrenAreAllowed =
      event.childrenPolicy === "allowed" ||
      event.childrenPolicy === "minimum_age";

    if (status === "accepted" && childrenAreAllowed) {
      const hasChildren = body.hasChildren;

      if (
        hasChildren !== true &&
        hasChildren !== false
      ) {
        return NextResponse.json(
          {
            error:
              "Merci d’indiquer si vous serez accompagné(e) d’un ou plusieurs enfants.",
          },
          { status: 400 }
        );
      }

      if (hasChildren === true) {
        childrenCount = Number(body.childrenCount);
        childrenAges =
          typeof body.childrenAges === "string"
            ? body.childrenAges.trim()
            : "";

        if (
          !Number.isInteger(childrenCount) ||
          childrenCount < 1
        ) {
          return NextResponse.json(
            {
              error:
                "Merci d’indiquer un nombre d’enfants valide.",
            },
            { status: 400 }
          );
        }

        if (!childrenAges) {
          return NextResponse.json(
            {
              error:
                "Merci d’indiquer l’âge des enfants.",
            },
            { status: 400 }
          );
        }
      }
    }

    // Si les enfants sont interdits, si l'invité est absent,
    // s'il ne sait pas encore ou s'il répond "Non",
    // les anciennes informations concernant les enfants
    // sont automatiquement effacées.
    if (
      status !== "accepted" ||
      !childrenAreAllowed ||
      body.hasChildren !== true
    ) {
      childrenCount = 0;
      childrenAges = null;
    }

    // 6. Charger les questions personnalisées de l'événement
    const questions = await db.orm.public.Question
      .where({ eventId: guest.eventId })
      .all();

    const submittedAnswers: SubmittedAnswer[] = Array.isArray(
      body.answers
    )
      ? body.answers
          .filter(
            (answer: unknown): answer is SubmittedAnswer => {
              if (
                typeof answer !== "object" ||
                answer === null
              ) {
                return false;
              }

              const candidate = answer as {
                questionId?: unknown;
                value?: unknown;
              };

              return (
                typeof candidate.questionId === "number" &&
                Number.isInteger(candidate.questionId) &&
                typeof candidate.value === "string"
              );
            }
          )
          .map((answer: SubmittedAnswer) => ({
            questionId: answer.questionId,
            value: answer.value.trim(),
          }))
      : [];

    // 7. Vérifier que les réponses appartiennent bien
    // à cet événement
    for (const submittedAnswer of submittedAnswers) {
      const questionExists = questions.some(
        (question) =>
          question.id === submittedAnswer.questionId
      );

      if (!questionExists) {
        return NextResponse.json(
          {
            error:
              "Une des réponses ne correspond pas à cet événement.",
          },
          { status: 400 }
        );
      }
    }

    function getSubmittedValue(questionId: number) {
      return (
        submittedAnswers.find(
          (answer) => answer.questionId === questionId
        )?.value ?? ""
      );
    }

    function isQuestionVisible(
      question: (typeof questions)[number]
    ) {
      if (
        question.conditionQuestionId === null ||
        !question.conditionValue
      ) {
        return true;
      }

      const parentQuestion = questions.find(
        (candidate) =>
          candidate.id === question.conditionQuestionId
      );

      if (!parentQuestion) {
        return false;
      }

      if (!isQuestionVisible(parentQuestion)) {
        return false;
      }

      const parentValue = getSubmittedValue(
        parentQuestion.id
      );

      return parentValue === question.conditionValue;
    }

    // 8. Vérifier uniquement les questions personnalisées
    // obligatoires qui sont réellement visibles
    for (const question of questions) {
      if (!isQuestionVisible(question)) {
        continue;
      }

      if (!question.required) {
        continue;
      }

      const value = getSubmittedValue(question.id);

      if (!value) {
        return NextResponse.json(
          {
            error: `Merci de répondre à la question : « ${question.label} »`,
          },
          { status: 400 }
        );
      }
    }

    // 9. Enregistrer la présence, les accompagnants
    // et les informations concernant les enfants
    await db.orm.public.Guest
      .where({ id: guest.id })
      .update({
        status,
        companionCount,
        childrenCount,
        childrenAges,
      });

    // 10. Enregistrer les réponses personnalisées visibles.
    // Si une question devient cachée, son ancienne réponse
    // est vidée.
    for (const question of questions) {
      const visible = isQuestionVisible(question);

      const value = visible
        ? getSubmittedValue(question.id)
        : "";

      const existingAnswer = await db.orm.public.Answer
        .where({
          guestId: guest.id,
          questionId: question.id,
        })
        .first();

      if (existingAnswer) {
        await db.orm.public.Answer
          .where({ id: existingAnswer.id })
          .update({
            value,
          });

        continue;
      }

      if (value.length === 0) {
        continue;
      }

      await db.orm.public.Answer.create({
        value,
        guestId: guest.id,
        questionId: question.id,
      });
    }

    return NextResponse.json(
      {
        message: "Réponse enregistrée avec succès.",
        status,
        companionCount,
        childrenCount,
        childrenAges,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur réponse invitation :", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de l’enregistrement de la réponse.",
      },
      { status: 500 }
    );
  }
}