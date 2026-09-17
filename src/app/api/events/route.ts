import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/prisma/db";
import { verifySessionToken } from "@/lib/session";

const ALLOWED_EVENT_TYPES = [
  "wedding",
  "birthday",
  "baptism",
  "ceremony",
  "party",
  "professional",
  "other",
] as const;

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

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const eventType =
      typeof body.eventType === "string"
        ? body.eventType.trim()
        : "other";

    const eventDate =
      typeof body.eventDate === "string"
        ? body.eventDate.trim()
        : "";

    const eventTime =
      typeof body.eventTime === "string"
        ? body.eventTime.trim() || null
        : null;

    const location =
      typeof body.location === "string"
        ? body.location.trim() || null
        : null;

    const description =
      typeof body.description === "string"
        ? body.description.trim() || null
        : null;

    const childrenPolicy =
      typeof body.childrenPolicy === "string"
        ? body.childrenPolicy
        : "allowed";

    const minimumChildAge =
      childrenPolicy === "minimum_age"
        ? Number(body.minimumChildAge)
        : null;

    const dressCode =
      typeof body.dressCode === "string"
        ? body.dressCode.trim() || null
        : null;

    const importantInfo =
      typeof body.importantInfo === "string"
        ? body.importantInfo.trim() || null
        : null;

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
      !ALLOWED_EVENT_TYPES.includes(
        eventType as (typeof ALLOWED_EVENT_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        {
          error: "Le type d’événement est invalide.",
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
      eventType,
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
          eventType: event.eventType,
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