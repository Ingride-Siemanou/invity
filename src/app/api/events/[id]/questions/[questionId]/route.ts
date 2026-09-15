import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { db } from "@/prisma/db";

type QuestionRouteProps = {
  params: Promise<{
    id: string;
    questionId: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: QuestionRouteProps
) {
  try {
    const { id, questionId } = await params;

    const eventId = Number(id);
    const targetQuestionId = Number(questionId);

    if (
      !Number.isInteger(eventId) ||
      !Number.isInteger(targetQuestionId)
    ) {
      return NextResponse.json(
        { error: "Question invalide." },
        { status: 400 }
      );
    }

    // Vérifier la connexion de l'organisateur
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

    // Vérifier que l'événement appartient bien
    // à l'organisateur connecté
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

    // Vérifier que la question appartient
    // bien à cet événement
    const question = await db.orm.public.Question
      .where({
        id: targetQuestionId,
        eventId,
      })
      .first();

    if (!question) {
      return NextResponse.json(
        { error: "Question introuvable." },
        { status: 404 }
      );
    }

    // Charger les questions de l'événement
    const eventQuestions = await db.orm.public.Question
      .where({ eventId })
      .all();

    // Si d'autres questions dépendent de celle-ci,
    // supprimer leur condition avant de supprimer
    // la question principale.
    const dependentQuestions = eventQuestions.filter(
      (item) =>
        item.conditionQuestionId === targetQuestionId
    );

    for (const dependentQuestion of dependentQuestions) {
      await db.orm.public.Question
        .where({ id: dependentQuestion.id })
        .update({
          conditionQuestionId: null,
          conditionValue: null,
        });
    }

    // Supprimer d'abord les réponses enregistrées
    // pour cette question.
    const answers = await db.orm.public.Answer
      .where({ questionId: targetQuestionId })
      .all();

    for (const answer of answers) {
      await db.orm.public.Answer
        .where({ id: answer.id })
        .delete();
    }

    // Supprimer enfin la question
    await db.orm.public.Question
      .where({ id: targetQuestionId })
      .delete();

    return NextResponse.json(
      {
        message: "Question supprimée avec succès.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur suppression question :", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la suppression de la question.",
      },
      { status: 500 }
    );
  }
}