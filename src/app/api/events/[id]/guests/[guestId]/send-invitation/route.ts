import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { db } from "@/prisma/db";
import { verifySessionToken } from "@/lib/session";

type SendInvitationRouteProps = {
  params: Promise<{
    id: string;
    guestId: string;
  }>;
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: Request,
  { params }: SendInvitationRouteProps
) {
  try {
    const { id, guestId } = await params;

    const eventId = Number(id);
    const currentGuestId = Number(guestId);

    if (
      Number.isNaN(eventId) ||
      Number.isNaN(currentGuestId)
    ) {
      return NextResponse.json(
        { error: "Événement ou invité invalide." },
        { status: 400 }
      );
    }

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

    const event = await db.orm.public.Event
      .where({
        id: eventId,
        userId: session.userId,
      })
      .first();

    if (!event) {
      return NextResponse.json(
        { error: "Événement introuvable." },
        { status: 404 }
      );
    }

    const guest = await db.orm.public.Guest
      .where({
        id: currentGuestId,
        eventId,
      })
      .first();

    if (!guest) {
      return NextResponse.json(
        { error: "Invité introuvable." },
        { status: 404 }
      );
    }

    if (!guest.email) {
      return NextResponse.json(
        {
          error:
            "Aucune adresse e-mail n'est renseignée pour cet invité.",
        },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY est manquante.");

      return NextResponse.json(
        {
          error:
            "Le service d'envoi d'e-mails n'est pas configuré.",
        },
        { status: 500 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      new URL(request.url).origin;

    const invitationUrl = `${origin}/i/${guest.token}`;

    const { data, error } = await resend.emails.send({
      from: "Invity <onboarding@resend.dev>",
      to: guest.email,
      subject: `Invitation à ${event.title}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8" />
          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background-color: #fdf2f8;
              font-family: Arial, Helvetica, sans-serif;
              color: #1f2937;
            "
          >
            <div
              style="
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
              "
            >
              <div
                style="
                  background-color: #ffffff;
                  border-radius: 24px;
                  padding: 40px 30px;
                  border: 1px solid #fce7f3;
                "
              >
                <div
                  style="
                    width: 48px;
                    height: 4px;
                    border-radius: 999px;
                    background-color: #db2777;
                    margin-bottom: 24px;
                  "
                ></div>

                <p
                  style="
                    margin: 0 0 12px;
                    color: #db2777;
                    font-size: 14px;
                    font-weight: 700;
                  "
                >
                  INVITY
                </p>

                <h1
                  style="
                    margin: 0 0 24px;
                    font-size: 28px;
                    line-height: 1.25;
                    color: #111827;
                  "
                >
                  Vous êtes invité(e)
                </h1>

                <p
                  style="
                    margin: 0 0 16px;
                    font-size: 16px;
                    line-height: 1.7;
                  "
                >
                  Bonjour ${escapeHtml(guest.firstName)},
                </p>

                <p
                  style="
                    margin: 0 0 16px;
                    font-size: 16px;
                    line-height: 1.7;
                  "
                >
                  Vous êtes invité(e) à
                  <strong>${escapeHtml(event.title)}</strong>.
                </p>

                <p
                  style="
                    margin: 0 0 28px;
                    font-size: 16px;
                    line-height: 1.7;
                    color: #4b5563;
                  "
                >
                  Consultez votre invitation personnelle et indiquez
                  votre réponse en cliquant sur le bouton ci-dessous.
                </p>

                <a
                  href="${invitationUrl}"
                  style="
                    display: inline-block;
                    background-color: #db2777;
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 15px;
                    font-weight: 700;
                    padding: 14px 24px;
                    border-radius: 12px;
                  "
                >
                  Voir mon invitation
                </a>

                <p
                  style="
                    margin: 32px 0 0;
                    font-size: 13px;
                    line-height: 1.6;
                    color: #9ca3af;
                  "
                >
                  Ce lien est personnel. Merci de ne pas le partager.
                </p>
              </div>

              <p
                style="
                  margin: 20px 0 0;
                  text-align: center;
                  font-size: 12px;
                  color: #9ca3af;
                "
              >
                Invity — Créez. Invitez. Célébrez.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Erreur Resend :", error);

      return NextResponse.json(
        {
          error:
            error.message ||
            "Impossible d'envoyer l'invitation par e-mail.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `Invitation envoyée à ${guest.email}.`,
        emailId: data?.id ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Erreur envoi invitation par e-mail :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de l'envoi de l'invitation.",
      },
      { status: 500 }
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}