import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { db } from "@/prisma/db";

const ALLOWED_EVENT_TYPES = [
  "wedding",
  "birthday",
  "baptism",
  "ceremony",
  "party",
  "professional",
  "other",
] as const;

const ALLOWED_THEMES = [
  "elegant",
  "romantic",
  "modern",
  "festive",
] as const;

const ALLOWED_PRESET_COLORS = [
  "rose",
  "purple",
  "blue",
  "green",
  "gold",
  "black",
] as const;

const ALLOWED_CHILDREN_POLICIES = [
  "allowed",
  "not_allowed",
  "minimum_age",
] as const;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isValidInvitationColor(color: string) {
  const isPresetColor = ALLOWED_PRESET_COLORS.includes(
    color as (typeof ALLOWED_PRESET_COLORS)[number]
  );

  const isHexColor = /^#[0-9A-Fa-f]{6}$/.test(color);

  return isPresetColor || isHexColor;
}

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("invity_session")?.value;

  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return null;
  }

  return session.userId;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const eventId = Number(id);

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return NextResponse.json(
        { error: "Événement invalide." },
        { status: 400 }
      );
    }

    const event = await db.orm.public.Event
      .where({
        id: eventId,
        userId,
      })
      .first();

    if (!event) {
      return NextResponse.json(
        { error: "Événement introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
        invitationTheme: event.invitationTheme,
        invitationColor: event.invitationColor,
        coverImageUrl: event.coverImageUrl,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors du chargement de l'événement :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de charger l'événement pour le moment.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const eventId = Number(id);

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return NextResponse.json(
        { error: "Événement invalide." },
        { status: 400 }
      );
    }

    const event = await db.orm.public.Event
      .where({
        id: eventId,
        userId,
      })
      .first();

    if (!event) {
      return NextResponse.json(
        { error: "Événement introuvable." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const isGeneralUpdate =
      "title" in body ||
      "eventType" in body ||
      "eventDate" in body ||
      "eventTime" in body ||
      "location" in body ||
      "description" in body ||
      "childrenPolicy" in body ||
      "minimumChildAge" in body ||
      "dressCode" in body ||
      "importantInfo" in body;

    const isCustomizationUpdate =
      "invitationTheme" in body ||
      "invitationColor" in body ||
      "coverImageUrl" in body;

    if (!isGeneralUpdate && !isCustomizationUpdate) {
      return NextResponse.json(
        { error: "Aucune modification à enregistrer." },
        { status: 400 }
      );
    }

    /*
     * MODIFICATION DES INFORMATIONS GÉNÉRALES
     */
    if (isGeneralUpdate) {
      const title =
        typeof body.title === "string"
          ? body.title.trim()
          : "";

      const eventType =
        typeof body.eventType === "string"
          ? body.eventType.trim()
          : "";

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
          ? body.childrenPolicy.trim()
          : "";

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
              "Le nom de l'événement et la date sont obligatoires.",
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
            error: "Le type d'événement est invalide.",
          },
          { status: 400 }
        );
      }

      if (
        !ALLOWED_CHILDREN_POLICIES.includes(
          childrenPolicy as (typeof ALLOWED_CHILDREN_POLICIES)[number]
        )
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
              "L'âge minimum doit être compris entre 0 et 18 ans.",
          },
          { status: 400 }
        );
      }

      const updatedEvent = await db.orm.public.Event
        .where({
          id: eventId,
          userId,
        })
        .update({
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
        });

      if (!updatedEvent) {
        return NextResponse.json(
          {
            error:
              "Impossible de mettre à jour l'événement.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Événement modifié avec succès.",
        event: {
          id: updatedEvent.id,
          title: updatedEvent.title,
          eventType: updatedEvent.eventType,
          eventDate: updatedEvent.eventDate,
          eventTime: updatedEvent.eventTime,
          location: updatedEvent.location,
          description: updatedEvent.description,
          childrenPolicy: updatedEvent.childrenPolicy,
          minimumChildAge: updatedEvent.minimumChildAge,
          dressCode: updatedEvent.dressCode,
          importantInfo: updatedEvent.importantInfo,
          invitationTheme: updatedEvent.invitationTheme,
          invitationColor: updatedEvent.invitationColor,
          coverImageUrl: updatedEvent.coverImageUrl,
        },
      });
    }

    /*
     * MODIFICATION DE LA PERSONNALISATION
     */
    const invitationTheme =
      typeof body.invitationTheme === "string"
        ? body.invitationTheme.trim()
        : "";

    const invitationColor =
      typeof body.invitationColor === "string"
        ? body.invitationColor.trim()
        : "";

    const coverImageUrl =
      typeof body.coverImageUrl === "string"
        ? body.coverImageUrl.trim()
        : "";

    if (
      !ALLOWED_THEMES.includes(
        invitationTheme as (typeof ALLOWED_THEMES)[number]
      )
    ) {
      return NextResponse.json(
        {
          error: "Thème d'invitation invalide.",
        },
        { status: 400 }
      );
    }

    if (!isValidInvitationColor(invitationColor)) {
      return NextResponse.json(
        {
          error: "Couleur d'invitation invalide.",
        },
        { status: 400 }
      );
    }

    const updatedEvent = await db.orm.public.Event
      .where({
        id: eventId,
        userId,
      })
      .update({
        invitationTheme,
        invitationColor,
        coverImageUrl: coverImageUrl || null,
      });

    if (!updatedEvent) {
      return NextResponse.json(
        {
          error:
            "Impossible de mettre à jour l'événement.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message:
        "Personnalisation enregistrée avec succès.",
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        eventType: updatedEvent.eventType,
        eventDate: updatedEvent.eventDate,
        eventTime: updatedEvent.eventTime,
        location: updatedEvent.location,
        description: updatedEvent.description,
        childrenPolicy: updatedEvent.childrenPolicy,
        minimumChildAge: updatedEvent.minimumChildAge,
        dressCode: updatedEvent.dressCode,
        importantInfo: updatedEvent.importantInfo,
        invitationTheme: updatedEvent.invitationTheme,
        invitationColor: updatedEvent.invitationColor,
        coverImageUrl: updatedEvent.coverImageUrl,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'événement :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible de mettre à jour l'événement pour le moment.",
      },
      { status: 500 }
    );
  }
}