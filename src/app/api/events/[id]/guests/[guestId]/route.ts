import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/prisma/db";
import { verifySessionToken } from "@/lib/session";

type GuestRouteProps = {
  params: Promise<{
    id: string;
    guestId: string;
  }>;
};

async function getAuthorizedGuest(
  eventId: number,
  guestId: number
) {
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

  const guest = await db.orm.public.Guest
    .where({
      id: guestId,
      eventId,
    })
    .first();

  if (!guest) {
    return {
      error: NextResponse.json(
        { error: "Invité introuvable." },
        { status: 404 }
      ),
    };
  }

  return {
    event,
    guest,
  };
}

export async function PATCH(
  request: Request,
  { params }: GuestRouteProps
) {
  try {
    const { id, guestId } = await params;

    const eventId = Number(id);
    const currentGuestId = Number(guestId);

    if (
      !Number.isInteger(eventId) ||
      !Number.isInteger(currentGuestId)
    ) {
      return NextResponse.json(
        { error: "Identifiant invalide." },
        { status: 400 }
      );
    }

    const authorization = await getAuthorizedGuest(
      eventId,
      currentGuestId
    );

    if (authorization.error) {
      return authorization.error;
    }

    const body = await request.json();

    const firstName =
      typeof body.firstName === "string"
        ? body.firstName.trim()
        : "";

    const lastName =
      typeof body.lastName === "string"
        ? body.lastName.trim()
        : "";

    const email =
      typeof body.email === "string" && body.email.trim()
        ? body.email.trim().toLowerCase()
        : null;

    const maxCompanions = Number(body.maxCompanions ?? 0);

    if (!firstName || !lastName) {
      return NextResponse.json(
        {
          error: "Le prénom et le nom sont obligatoires.",
        },
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

    const updatedGuest = await db.orm.public.Guest
      .where({
        id: currentGuestId,
        eventId,
      })
      .update({
        firstName,
        lastName,
        email,
        maxCompanions,
      });

    if (!updatedGuest) {
      return NextResponse.json(
        {
          error: "Impossible de modifier cet invité.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Invité modifié avec succès.",
        guest: {
          id: updatedGuest.id,
          firstName: updatedGuest.firstName,
          lastName: updatedGuest.lastName,
          email: updatedGuest.email,
          status: updatedGuest.status,
          token: updatedGuest.token,
          maxCompanions: updatedGuest.maxCompanions,
          companionCount: updatedGuest.companionCount,
          childrenCount: updatedGuest.childrenCount,
          childrenAges: updatedGuest.childrenAges,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur modification invité :", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la modification de l’invité.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: GuestRouteProps
) {
  try {
    const { id, guestId } = await params;

    const eventId = Number(id);
    const currentGuestId = Number(guestId);

    if (
      !Number.isInteger(eventId) ||
      !Number.isInteger(currentGuestId)
    ) {
      return NextResponse.json(
        { error: "Identifiant invalide." },
        { status: 400 }
      );
    }

    const authorization = await getAuthorizedGuest(
      eventId,
      currentGuestId
    );

    if (authorization.error) {
      return authorization.error;
    }

    const answers = await db.orm.public.Answer
      .where({
        guestId: currentGuestId,
      })
      .all();

    for (const answer of answers) {
      await db.orm.public.Answer
        .where({
          id: answer.id,
        })
        .delete();
    }

    await db.orm.public.Guest
      .where({
        id: currentGuestId,
        eventId,
      })
      .delete();

    return NextResponse.json(
      {
        message: "Invité supprimé avec succès.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur suppression invité :", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la suppression de l’invité.",
      },
      { status: 500 }
    );
  }
}