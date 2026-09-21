
import { NextResponse } from "next/server";
import { Resend } from "resend";
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getStatusLabel(status: string) {
  if (status === "accepted") {
    return "Présent(e)";
  }

  if (status === "declined") {
    return "Absent(e)";
  }

  return "Je ne sais pas encore";
}

export async function POST(
  request: Request,
  { params }: ResponseRouteProps
) {
  try {
    const { token } = await params;

    const guest = await db.orm.public.Guest
      .where({ token })
      .first();

    if (!guest) {
      return NextResponse.json(
        { error: "Invitation introuvable." },
        { status: 404 }
      );
    }

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

    if (
      status !== "accepted" ||
      !childrenAreAllowed ||
      body.hasChildren !== true
    ) {
      childrenCount = 0;
      childrenAges = null;
    }

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
    ): boolean {
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

    await db.orm.public.Guest
      .where({ id: guest.id })
      .update({
        status,
        companionCount,
        childrenCount,
        childrenAges,
      });

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

    try {
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        console.warn(
          "Notification organisateur non envoyée : RESEND_API_KEY manquante."
        );
      } else {
        const organizer = await db.orm.public.User
          .where({ id: event.userId })
          .first();

        if (!organizer?.email) {
          console.warn(
            "Notification organisateur non envoyée : adresse e-mail introuvable."
          );
        } else {
          const resend = new Resend(resendApiKey);

          const guestName =
            `${guest.firstName} ${guest.lastName}`.trim();

          const responseLabel = getStatusLabel(status);

          const peopleCount =
            status === "accepted"
              ? 1 + companionCount + childrenCount
              : 0;

          const details = [
            `<p><strong>Invité :</strong> ${escapeHtml(guestName)}</p>`,
            `<p><strong>Réponse :</strong> ${escapeHtml(responseLabel)}</p>`,
          ];

          if (status === "accepted") {
            details.push(
              `<p><strong>Accompagnants :</strong> ${companionCount}</p>`,
              `<p><strong>Enfants :</strong> ${childrenCount}</p>`,
              `<p><strong>Nombre total de personnes :</strong> ${peopleCount}</p>`
            );

            if (childrenAges) {
              details.push(
                `<p><strong>Âge des enfants :</strong> ${escapeHtml(childrenAges)}</p>`
              );
            }
          }

          const visibleAnswers = questions
            .filter((question) => isQuestionVisible(question))
            .map((question) => ({
              label: question.label,
              value: getSubmittedValue(question.id),
            }))
            .filter((answer) => answer.value.length > 0);

          if (visibleAnswers.length > 0) {
            details.push(
              "<h2>Réponses personnalisées</h2>"
            );

            for (const answer of visibleAnswers) {
              details.push(
                `<p><strong>${escapeHtml(answer.label)} :</strong> ${escapeHtml(answer.value)}</p>`
              );
            }
          }

          const { error: emailError } = await resend.emails.send({
            from: "Invity <onboarding@resend.dev>",
            to: organizer.email,
            subject: `Nouvelle réponse à ${event.title}`,
            html: `
              <div style="max-width:600px;margin:0 auto;padding:32px;font-family:Arial,sans-serif;color:#1f2937;">
                <p style="font-size:22px;font-weight:bold;color:#db2777;margin:0 0 24px;">
                  Invity
                </p>
                <h1 style="font-size:24px;margin:0 0 16px;">
                  Nouvelle réponse à votre invitation
                </h1>
                <p>
                  Un invité a répondu à votre événement
                  <strong>${escapeHtml(event.title)}</strong>.
                </p>
                <div style="margin-top:24px;padding:20px;border:1px solid #fbcfe8;border-radius:12px;background:#fdf2f8;">
                  ${details.join("\n")}
                </div>
                <p style="margin-top:24px;font-size:13px;color:#6b7280;">
                  Retrouvez toutes les réponses dans votre espace organisateur Invity.
                </p>
              </div>
            `,
          });

          if (emailError) {
            console.error(
              "Erreur notification organisateur :",
              emailError
            );
          }
        }
      }
    } catch (notificationError) {
      console.error(
        "Impossible d'envoyer la notification à l'organisateur :",
        notificationError
      );
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