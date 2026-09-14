import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/prisma/db";
import { verifySessionToken } from "@/lib/session";

export async function POST(request: Request) {
  try {
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

    const body = await request.json();

    const title = body.title?.trim();
    const eventDate = body.eventDate?.trim();
    const eventTime = body.eventTime?.trim() || null;
    const location = body.location?.trim() || null;
    const description = body.description?.trim() || null;

    if (!title || !eventDate) {
      return NextResponse.json(
        { error: "Le nom de l’événement et la date sont obligatoires." },
        { status: 400 }
      );
    }

    const event = await db.orm.public.Event.create({
      title,
      eventDate,
      eventTime,
      location,
      description,
      userId: session.userId,
    });

    return NextResponse.json(
      {
        message: "Événement créé avec succès.",
        event: {
          id: event.id,
          title: event.title,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          location: event.location,
          description: event.description,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur création événement :", error);

    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de l’événement." },
      { status: 500 }
    );
  }
}