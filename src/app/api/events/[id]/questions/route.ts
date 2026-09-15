import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { db } from "@/prisma/db";

type QuestionsRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: QuestionsRouteProps
) {
  try {
    const { id } = await params;
    const eventId = Number(id);

    if (!Number.isInteger(eventId)) {
      return NextResponse.json(
        { error: "Événement invalide." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("invity_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        { error: "Session invalide." },
        { status: 401 }
      );
    }

    const event = await db.orm.public.Event
      .where({
        id: eventId,
        userId: session.userId,
      })
      .first();

    if (!event) {
      return NextResponse.json(
        { error: "Événement introuvable." },
        { status: 404 }
      );
    }

    const questions = await db.orm.public.Question
      .where({ eventId })
      .all();

    const sortedQuestions = [...questions].sort(
      (a, b) => a.position - b.position
    );

    return NextResponse.json(
      { questions: sortedQuestions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur récupération questions :", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors du chargement des questions.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: QuestionsRouteProps
) {
  try {
    const { id } = await params;
    const eventId = Number(id);

    if (!Number.isInteger(eventId)) {
      return NextResponse.json(
        { error: "Événement invalide." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("invity_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        { error: "Session invalide." },
        { status: 401 }
      );
    }

    const event = await db.orm.public.Event
      .where({
        id: eventId,
        userId: session.userId,
      })
      .first();

    if (!event) {
      return NextResponse.json(
        { error: "Événement introuvable." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const label =
      typeof body.label === "string"
        ? body.label.trim()
        : "";

    const type =
      typeof body.type === "string"
        ? body.type
        : "text";

    const required = body.required === true;

    const conditionQuestionId =
      typeof body.conditionQuestionId === "number" &&
      Number.isInteger(body.conditionQuestionId)
        ? body.conditionQuestionId
        : null;

    const conditionValue =
      typeof body.conditionValue === "string"
        ? body.conditionValue.trim()
        : null;

    const allowedTypes = [
      "text",
      "textarea",
      "yes_no",
      "number",
    ];

    if (!label) {
      return NextResponse.json(
        { error: "La question est obligatoire." },
        { status: 400 }
      );
    }

    if (label.length > 300) {
      return NextResponse.json(
        {
          error:
            "La question ne peut pas dépasser 300 caractères.",
        },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: "Type de question invalide." },
        { status: 400 }
      );
    }

    let validatedConditionQuestionId: number | null = null;
    let validatedConditionValue: string | null = null;

    if (conditionQuestionId !== null) {
      if (!conditionValue) {
        return NextResponse.json(
          {
            error:
              "La valeur de la condition est obligatoire.",
          },
          { status: 400 }
        );
      }

      const conditionQuestion =
        await db.orm.public.Question
          .where({
            id: conditionQuestionId,
            eventId,
          })
          .first();

      if (!conditionQuestion) {
        return NextResponse.json(
          {
            error:
              "La question utilisée comme condition est invalide.",
          },
          { status: 400 }
        );
      }

      if (
        conditionQuestion.type === "yes_no" &&
        conditionValue !== "Oui" &&
        conditionValue !== "Non"
      ) {
        return NextResponse.json(
          {
            error:
              "La condition doit être Oui ou Non pour cette question.",
          },
          { status: 400 }
        );
      }

      validatedConditionQuestionId =
        conditionQuestion.id;

      validatedConditionValue = conditionValue;
    }

    const existingQuestions =
      await db.orm.public.Question
        .where({ eventId })
        .all();

    const nextPosition =
      existingQuestions.length === 0
        ? 0
        : Math.max(
            ...existingQuestions.map(
              (question) => question.position
            )
          ) + 1;

    const question = await db.orm.public.Question.create({
      label,
      type,
      required,
      position: nextPosition,
      conditionQuestionId:
        validatedConditionQuestionId,
      conditionValue: validatedConditionValue,
      eventId,
    });

    return NextResponse.json(
      {
        message: "Question ajoutée avec succès.",
        question,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur création question :", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la création de la question.",
      },
      { status: 500 }
    );
  }
}