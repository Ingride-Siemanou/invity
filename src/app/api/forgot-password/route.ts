import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/prisma/db";

const successMessage =
  "Si un compte est associé à cette adresse e-mail, vous recevrez un lien de réinitialisation.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Veuillez saisir une adresse e-mail valide." },
        { status: 400 }
      );
    }

    const user = await db.orm.public.User.where({ email }).first();

    if (!user) {
      return NextResponse.json({ message: successMessage });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY est manquante.");

      return NextResponse.json(
        { error: "Le service d'envoi d'e-mails est indisponible." },
        { status: 500 }
      );
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const origin =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      new URL(request.url).origin;

    const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(token)}`;

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "Invity <onboarding@resend.dev>",
      to: user.email,
      subject: "Réinitialisation de votre mot de passe Invity",
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#1f2937">
          <h1 style="color:#db2777">Invity</h1>
          <h2>Réinitialisez votre mot de passe</h2>
          <p>Une demande de réinitialisation a été effectuée pour votre compte Invity.</p>
          <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
          <p style="margin:32px 0">
            <a href="${resetUrl}" style="background-color:#db2777;color:#ffffff;padding:14px 22px;border-radius:10px;text-decoration:none;font-weight:bold">
              Choisir un nouveau mot de passe
            </a>
          </p>
          <p>Ce lien est valable pendant 30 minutes et ne pourra être utilisé qu'une seule fois.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.</p>
          <p style="color:#9ca3af;font-size:12px;margin-top:32px">Invity — Créez. Invitez. Célébrez.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Erreur Resend lors de la réinitialisation :", error);

      return NextResponse.json(
        { error: "Impossible d'envoyer l'e-mail pour le moment." },
        { status: 500 }
      );
    }

    await db.orm.public.User.where({ id: user.id }).update({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
    });

    return NextResponse.json({ message: successMessage });
  } catch (error) {
    console.error("Erreur demande de réinitialisation :", error);

    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}