import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/prisma/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token =
      typeof body.token === "string" ? body.token.trim() : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!token || !password) {
      return NextResponse.json(
        { error: "Le lien de réinitialisation est invalide." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Le mot de passe doit contenir au moins 8 caractères.",
        },
        { status: 400 }
      );
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await db.orm.public.User
      .where({ passwordResetTokenHash: tokenHash })
      .first();

    if (
      !user ||
      !user.passwordResetExpiresAt ||
      new Date(user.passwordResetExpiresAt).getTime() <= Date.now()
    ) {
      return NextResponse.json(
        {
          error:
            "Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.orm.public.User
      .where({
        id: user.id,
        passwordResetTokenHash: tokenHash,
      })
      .update({
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      });

    return NextResponse.json({
      message:
        "Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.",
    });
  } catch (error) {
    console.error("Erreur réinitialisation du mot de passe :", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la réinitialisation du mot de passe.",
      },
      { status: 500 }
    );
  }
}