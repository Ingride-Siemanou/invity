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

    const cookieStore = await cookies();
    const token = cookieStore.get("invity_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Vous devez être connecté." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        { error: "Session invalide ou expirée." },
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

    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const email = body.email?.trim().toLowerCase() || null;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Le prénom et le nom sont obligatoires." },
        { status: 400 }
      );
    }

    const guest = await db.orm.public.Guest.create({
      firstName,
      lastName,
      email,
      token: randomUUID(),
      status: "pending",
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
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur ajout invité :", error);

    return NextResponse.json(
      { error: "Une erreur est survenue lors de l’ajout de l’invité." },
      { status: 500 }
    );
  }
}