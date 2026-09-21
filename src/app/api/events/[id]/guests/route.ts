import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "@/prisma/db";
import { verifySessionToken } from "@/lib/session";

type GuestsRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getAuthorizedEvent(eventId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("invity_session")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { error: "Vous devez être connecté." },
        { status: 401 }
      ),
    };
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Session invalide ou expirée." },
        { status: 401 }
      ),
    };
  }

  const event = await db.orm.public.Event
    .where({
      id: eventId,
      userId: session.userId,
    })
    .first();

  if (!event) {
    return {
      error: NextResponse.json(
        { error: "Événement introuvable." },
        { status: 404 }
      ),
    };
  }

  return { event };
}

export async function GET(
  request: Request,
  { params }: GuestsRouteProps
) {
  try {
    const { id } = await params;
    const eventId = Number(id);

    if (Number.isNaN(eventId)) {
      return NextResponse.json(
        { error: "Événement invalide." },
        { status: 400 }
      );
    }

    const authorization = await getAuthorizedEvent(eventId);

    if (authorization.error) {
      return authorization.error;
    }

    const guests = await db.orm.public.Guest
      .where({ eventId })
      .all();

    const questions = await db.orm.public.Question
      .where({ eventId })
      .all();

    const sortedQuestions = [...questions].sort(
      (a, b) => a.position - b.position
    );

    const guestsWithAnswers = await Promise.all(
      guests.map(async (guest) => {
        const answers = await db.orm.public.Answer
          .where({ guestId: guest.id })
          .all();

        const formattedAnswers = sortedQuestions.map(
          (question) => {
            const answer = answers.find(
              (currentAnswer) =>
                currentAnswer.questionId === question.id
            );

            return {
              questionId: question.id,
              questionLabel: question.label,
              questionType: question.type,
              required: question.required,
              value: answer?.value ?? "",
            };
          }
        );

        return {
          id: guest.id,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          status: guest.status,
          token: guest.token,

          maxCompanions: guest.maxCompanions,
          companionCount: guest.companionCount,

          childrenCount: guest.childrenCount,
          childrenAges: guest.childrenAges,

          answers: formattedAnswers,
        };
      })
    );

    return NextResponse.json(
      {
        event: {
          title: authorization.event!.title,
          eventDate: authorization.event!.eventDate,
          eventTime: authorization.event!.eventTime,
          location: authorization.event!.location,
        },
        guests: guestsWithAnswers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur récupération invités :", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la récupération des invités.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: GuestsRouteProps
) {
  try {
    const { id } = await params;
    const eventId = Number(id);

    if (Number.isNaN(eventId)) {
      return NextResponse.json(
        { error: "Événement invalide." },
        { status: 400 }
      );
    }

    const authorization = await getAuthorizedEvent(eventId);

    if (authorization.error) {
      return authorization.error;
    }

    const body = await request.json();

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const email = body.email?.trim().toLowerCase() || null;
    const maxCompanions = Number(body.maxCompanions ?? 0);

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Le prénom et le nom sont obligatoires." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(maxCompanions) ||
      maxCompanions < 0 ||
      maxCompanions > 20
    ) {
      return NextResponse.json(
        {
          error:
            "Le nombre d’accompagnants doit être compris entre 0 et 20.",
        },
        { status: 400 }
      );
    }

    const guest = await db.orm.public.Guest.create({
      firstName,
      lastName,
      email,
      token: randomUUID(),
      status: "pending",

      maxCompanions,
      companionCount: 0,

      childrenCount: 0,
      childrenAges: null,

      eventId,
    });

    return NextResponse.json(
      {
        message: "Invité ajouté avec succès.",
        guest: {
          id: guest.id,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          status: guest.status,
          token: guest.token,

          maxCompanions: guest.maxCompanions,
          companionCount: guest.companionCount,

          childrenCount: guest.childrenCount,
          childrenAges: guest.childrenAges,

          answers: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur ajout invité :", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de l’ajout de l’invité.",
      },
      { status: 500 }
    );
  }
}