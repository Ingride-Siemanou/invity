import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/prisma/db";
import { createSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "L'adresse e-mail et le mot de passe sont obligatoires." },
        { status: 400 }
      );
    }

    const user = await db.orm.public.User
      .where({ email })
      .first();

    if (!user) {
      return NextResponse.json(
        { error: "Adresse e-mail ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordIsValid) {
      return NextResponse.json(
        { error: "Adresse e-mail ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const cookieStore = await cookies();

    cookieStore.set("invity_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json(
      {
        message: "Connexion réussie.",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur connexion :", error);

    return NextResponse.json(
      { error: "Une erreur est survenue lors de la connexion." },
      { status: 500 }
    );
  }
}