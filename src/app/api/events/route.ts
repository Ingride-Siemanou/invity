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

    const childrenPolicy = body.childrenPolicy || "allowed";

    const minimumChildAge =
      childrenPolicy === "minimum_age"
        ? Number(body.minimumChildAge)
        : null;

    const dressCode = body.dressCode?.trim() || null;
    const importantInfo = body.importantInfo?.trim() || null;

    if (!title || !eventDate) {
      return NextResponse.json(
        {
          error:
            "Le nom de l’événement et la date sont obligatoires.",
        },
        { status: 400 }
      );
    }

    if (
      childrenPolicy !== "allowed" &&
      childrenPolicy !== "not_allowed" &&
      childrenPolicy !== "minimum_age"
    ) {
      return NextResponse.json(
        {
          error:
            "La règle concernant les enfants est invalide.",
        },
        { status: 400 }
      );
    }

    if (
      childrenPolicy === "minimum_age" &&
      (
        minimumChildAge === null ||
        !Number.isInteger(minimumChildAge) ||
        minimumChildAge < 0 ||
        minimumChildAge > 18
      )
    ) {
      return NextResponse.json(
        {
          error:
            "L’âge minimum doit être compris entre 0 et 18 ans.",
        },
        { status: 400 }
      );
    }

    const event = await db.orm.public.Event.create({
      title,
      eventDate,
      eventTime,
      location,
      description,
      childrenPolicy,
      minimumChildAge,
      dressCode,
      importantInfo,
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
          childrenPolicy: event.childrenPolicy,
          minimumChildAge: event.minimumChildAge,
          dressCode: event.dressCode,
          importantInfo: event.importantInfo,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur création événement :", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la création de l’événement.",
      },
      { status: 500 }
    );
  }
}