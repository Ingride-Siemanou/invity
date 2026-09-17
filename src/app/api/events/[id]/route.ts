import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { db } from "@/prisma/db";

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
        { error: "Thème d'invitation invalide." },
        { status: 400 }
      );
    }

    if (!isValidInvitationColor(invitationColor)) {
      return NextResponse.json(
        { error: "Couleur d'invitation invalide." },
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
          error: "Impossible de mettre à jour l'événement.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Personnalisation enregistrée avec succès.",
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        invitationTheme: updatedEvent.invitationTheme,
        invitationColor: updatedEvent.invitationColor,
        coverImageUrl: updatedEvent.coverImageUrl,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la personnalisation de l'invitation :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Impossible d'enregistrer la personnalisation pour le moment.",
      },
      { status: 500 }
    );
  }
}