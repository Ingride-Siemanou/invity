import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

type ResponseRouteProps = {
  params: Promise<{
    token: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: ResponseRouteProps
) {
  try {
    const { token } = await params;

    const guest = await db.orm.public.Guest
      .where({ token })
      .first();

    if (!guest) {
      return NextResponse.json(
        { error: "Invitation introuvable." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const status = body.status;

    if (status !== "accepted" && status !== "declined") {
      return NextResponse.json(
        { error: "Réponse invalide." },
        { status: 400 }
      );
    }

    await db.orm.public.Guest
      .where({ id: guest.id })
      .update({
        status,
      });

    return NextResponse.json(
      {
        message: "Réponse enregistrée avec succès.",
        status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur réponse invitation :", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de l’enregistrement de la réponse.",
      },
      { status: 500 }
    );
  }
}