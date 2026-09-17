import { notFound } from "next/navigation";
import { db } from "@/prisma/db";
import ResponseButtons from "./response-buttons";

type InvitationPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitationPage({
  params,
}: InvitationPageProps) {
  const { token } = await params;

  const guest = await db.orm.public.Guest
    .where({ token })
    .first();

  if (!guest) {
    notFound();
  }

  const event = await db.orm.public.Event
    .where({ id: guest.eventId })
    .first();

  if (!event) {
    notFound();
  }

  const questions = await db.orm.public.Question
    .where({ eventId: event.id })
    .all();

  const sortedQuestions = [...questions].sort(
    (a, b) => a.position - b.position
  );

  const invitationColor =
    /^#[0-9A-Fa-f]{6}$/.test(
      event.invitationColor || ""
    )
      ? event.invitationColor
      : "#DB2777";

  const invitationTheme =
    event.invitationTheme || "elegant";

  const isModern =
    invitationTheme === "modern";

  const isRomantic =
    invitationTheme === "romantic";

  const isFestive =
    invitationTheme === "festive";

  const softColor = `${invitationColor}12`;
  const borderColor = `${invitationColor}35`;

  const cardRadius = isModern
    ? "rounded-none"
    : isRomantic
      ? "rounded-[36px]"
      : isFestive
        ? "rounded-[28px]"
        : "rounded-3xl";

  const titleClass = isRomantic
    ? "font-serif italic"
    : isModern
      ? "font-bold uppercase tracking-wide"
      : isFestive
        ? "font-extrabold"
        : "font-bold";

  return (
    <main
      className="min-h-screen px-4 py-8 sm:px-6 sm:py-12"
      style={{
        backgroundColor: softColor,
      }}
    >
      <div className="mx-auto max-w-3xl">
        <div
          className={`overflow-hidden bg-white text-center shadow-xl ${cardRadius}`}
        >
          {/* PHOTO DE COUVERTURE */}
          {event.coverImageUrl && (
            <div className="relative h-56 w-full sm:h-72">
              <img
                src={event.coverImageUrl}
                alt={`Photo de couverture de ${event.title}`}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>
          )}

          {/* CONTENU */}
          <div className="p-6 sm:p-8">
            {/* LOGO */}
            <div
              className={`text-3xl font-bold ${
                isRomantic
                  ? "font-serif italic"
                  : isModern
                    ? "uppercase tracking-[0.08em]"
                    : ""
              }`}
              style={{
                color: invitationColor,
              }}
            >
              Invity
            </div>

            {isFestive && (
              <div className="mt-4 flex justify-center gap-3 text-xl">
                <span>✨</span>
                <span>🎉</span>
                <span>✨</span>
              </div>
            )}

            {/* INTRODUCTION */}
            <p
              className="mt-8 text-sm font-semibold uppercase tracking-widest"
              style={{
                color: invitationColor,
              }}
            >
              Vous êtes invité(e)
            </p>

            <h1
              className={`mt-3 text-4xl text-gray-900 sm:text-5xl ${titleClass}`}
            >
              {event.title}
            </h1>

            <p className="mt-6 text-lg text-gray-600">
              Bonjour{" "}
              <span className="font-semibold text-gray-900">
                {guest.firstName} {guest.lastName}
              </span>
            </p>

            {/* DATE / HEURE / LIEU */}
            <div
              className={`mt-8 p-6 ${isModern ? "rounded-none" : "rounded-2xl"}`}
              style={{
                backgroundColor: softColor,
                border: `1px solid ${borderColor}`,
              }}
            >
              <p className="font-semibold text-gray-900">
                {event.eventDate}
              </p>

              {event.eventTime && (
                <p className="mt-2 text-gray-600">
                  À {event.eventTime}
                </p>
              )}

              {event.location && (
                <p className="mt-2 text-gray-600">
                  {event.location}
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            {event.description && (
              <p className="mt-8 leading-7 text-gray-600">
                {event.description}
              </p>
            )}

            {/* INFORMATIONS */}
            <div className="mt-8 space-y-4 text-left">
              {guest.maxCompanions > 0 && (
                <div
                  className="p-5"
                  style={{
                    backgroundColor: softColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: isModern
                      ? "0"
                      : "1rem",
                  }}
                >
                  <p className="font-semibold text-gray-900">
                    👥 Accompagnant
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {guest.maxCompanions === 1
                      ? "Votre invitation vous permet de venir avec 1 accompagnant."
                      : `Votre invitation vous permet de venir avec jusqu’à ${guest.maxCompanions} accompagnants.`}
                  </p>
                </div>
              )}

              {event.childrenPolicy ===
                "not_allowed" && (
                <div
                  className="p-5"
                  style={{
                    backgroundColor: softColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: isModern
                      ? "0"
                      : "1rem",
                  }}
                >
                  <p className="font-semibold text-gray-900">
                    👶 Enfants
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Cet événement est réservé
                    aux adultes.
                  </p>
                </div>
              )}

              {event.childrenPolicy ===
                "minimum_age" &&
                event.minimumChildAge !==
                  null && (
                  <div
                    className="p-5"
                    style={{
                      backgroundColor: softColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: isModern
                        ? "0"
                        : "1rem",
                    }}
                  >
                    <p className="font-semibold text-gray-900">
                      👶 Enfants
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      Les enfants sont invités
                      à partir de{" "}
                      {
                        event.minimumChildAge
                      }{" "}
                      ans.
                    </p>
                  </div>
                )}

              {event.childrenPolicy ===
                "allowed" && (
                <div
                  className="p-5"
                  style={{
                    backgroundColor: softColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: isModern
                      ? "0"
                      : "1rem",
                  }}
                >
                  <p className="font-semibold text-gray-900">
                    👶 Enfants
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Les enfants sont les
                    bienvenus à cet
                    événement.
                  </p>
                </div>
              )}

              {event.dressCode && (
                <div
                  className="p-5"
                  style={{
                    backgroundColor: softColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: isModern
                      ? "0"
                      : "1rem",
                  }}
                >
                  <p className="font-semibold text-gray-900">
                    👗 Dress code
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {event.dressCode}
                  </p>
                </div>
              )}

              {event.importantInfo && (
                <div
                  className="p-5"
                  style={{
                    backgroundColor: softColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: isModern
                      ? "0"
                      : "1rem",
                  }}
                >
                  <p className="font-semibold text-gray-900">
                    ℹ️ Informations importantes
                  </p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                    {event.importantInfo}
                  </p>
                </div>
              )}
            </div>

            {/* RSVP EXISTANT — ON NE LE CASSE PAS */}
            <ResponseButtons
              token={guest.token}
              initialStatus={guest.status}
              maxCompanions={guest.maxCompanions}
              initialCompanionCount={
                guest.companionCount
              }
              childrenPolicy={
                event.childrenPolicy
              }
              minimumChildAge={
                event.minimumChildAge
              }
              initialChildrenCount={
                guest.childrenCount
              }
              initialChildrenAges={
                guest.childrenAges
              }
              questions={sortedQuestions.map(
                (question) => ({
                  id: question.id,
                  label: question.label,
                  type: question.type,
                  required:
                    question.required,
                  position:
                    question.position,
                  conditionQuestionId:
                    question.conditionQuestionId,
                  conditionValue:
                    question.conditionValue,
                })
              )}
            />

            {/* PIED DE PAGE */}
            <div
              className="mt-10 border-t pt-6"
              style={{
                borderColor: borderColor,
              }}
            >
              <p className="text-sm text-gray-400">
                Invity — Créez. Invitez.
                Célébrez.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}