import { notFound } from "next/navigation";
import { db } from "@/prisma/db";
import ResponseButtons from "./response-buttons";

type InvitationPageProps = {
  params: Promise<{
    token: string;
  }>;
};

function formatEventDate(date: string) {
  const match = date.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) {
    return date;
  }

  const [, year, month, day] = match;

  const months = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  const monthIndex = Number(month) - 1;

  if (
    monthIndex < 0 ||
    monthIndex > 11 ||
    Number(day) < 1 ||
    Number(day) > 31
  ) {
    return date;
  }

  return `${Number(day)} ${
    months[monthIndex]
  } ${year}`;
}

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

  const questions =
    await db.orm.public.Question
      .where({ eventId: event.id })
      .all();

  const sortedQuestions = [
    ...questions,
  ].sort(
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
  const mediumColor = `${invitationColor}22`;

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
        : "font-serif font-bold";

  const informationRadius = isModern
    ? "0"
    : "1rem";

  return (
    <main
      className="min-h-screen px-4 py-6 text-gray-900 sm:px-6 sm:py-12"
      style={{
        backgroundColor: softColor,
      }}
    >
      <div className="mx-auto max-w-3xl">
        <div
          className={`overflow-hidden border bg-white text-center shadow-xl ${cardRadius}`}
          style={{
            borderColor,
          }}
        >
          {/* Photo de couverture */}
          {event.coverImageUrl && (
            <div className="relative h-56 w-full sm:h-72 lg:h-80">
              <img
                src={event.coverImageUrl}
                alt={`Photo de couverture de ${event.title}`}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
            </div>
          )}

          {/* Bandeau de couleur */}
          <div
            className="h-2 w-full"
            style={{
              backgroundColor:
                invitationColor,
            }}
          />

          <div className="p-5 sm:p-8 lg:p-10">
            {/* Marque */}
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

            {/* Décoration festive sans emoji */}
            {isFestive && (
              <div className="mt-5 flex justify-center gap-2">
                <span
                  className="h-2 w-10 rounded-full"
                  style={{
                    backgroundColor:
                      invitationColor,
                  }}
                />

                <span className="h-2 w-10 rounded-full bg-purple-300" />

                <span className="h-2 w-10 rounded-full bg-pink-300" />
              </div>
            )}

            {/* Introduction */}
            <p
              className="mt-8 text-xs font-bold uppercase tracking-[0.2em] sm:text-sm"
              style={{
                color: invitationColor,
              }}
            >
              Vous êtes invité(e)
            </p>

            <h1
              className={`mx-auto mt-3 max-w-2xl break-words text-3xl text-gray-950 sm:text-5xl ${titleClass}`}
            >
              {event.title}
            </h1>

            <div
              className="mx-auto mt-6 h-1 w-16 rounded-full"
              style={{
                backgroundColor:
                  invitationColor,
              }}
            />

            <p className="mt-6 text-base text-gray-600 sm:text-lg">
              Bonjour{" "}
              <span className="font-semibold text-gray-950">
                {guest.firstName}{" "}
                {guest.lastName}
              </span>
            </p>

            {/* Date, heure et lieu */}
            <section
              className={`mt-8 overflow-hidden border ${
                isModern
                  ? "rounded-none"
                  : "rounded-2xl"
              }`}
              style={{
                borderColor,
                backgroundColor:
                  softColor,
              }}
            >
              <div className="grid divide-y divide-gray-200/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <EventDetail
                  label="Date"
                  value={formatEventDate(
                    event.eventDate
                  )}
                  color={invitationColor}
                />

                {event.eventTime ? (
                  <EventDetail
                    label="Heure"
                    value={event.eventTime}
                    color={invitationColor}
                  />
                ) : (
                  <EventDetail
                    label="Heure"
                    value="À préciser"
                    color={invitationColor}
                  />
                )}

                {event.location ? (
                  <EventDetail
                    label="Lieu"
                    value={event.location}
                    color={invitationColor}
                  />
                ) : (
                  <EventDetail
                    label="Lieu"
                    value="À préciser"
                    color={invitationColor}
                  />
                )}
              </div>
            </section>

            {/* Description */}
            {event.description && (
              <div className="mx-auto mt-8 max-w-2xl">
                <p className="whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
                  {event.description}
                </p>
              </div>
            )}

            {/* Informations */}
            <div className="mt-10 space-y-4 text-left">
              {guest.maxCompanions > 0 && (
                <InformationCard
                  title="Accompagnant"
                  color={invitationColor}
                  backgroundColor={
                    softColor
                  }
                  borderColor={
                    borderColor
                  }
                  borderRadius={
                    informationRadius
                  }
                >
                  {guest.maxCompanions ===
                  1
                    ? "Votre invitation vous permet de venir avec 1 accompagnant."
                    : `Votre invitation vous permet de venir avec jusqu’à ${guest.maxCompanions} accompagnants.`}
                </InformationCard>
              )}

              {event.childrenPolicy ===
                "not_allowed" && (
                <InformationCard
                  title="Enfants"
                  color={invitationColor}
                  backgroundColor={
                    softColor
                  }
                  borderColor={
                    borderColor
                  }
                  borderRadius={
                    informationRadius
                  }
                >
                  Cet événement est
                  réservé aux adultes.
                </InformationCard>
              )}

              {event.childrenPolicy ===
                "minimum_age" &&
                event.minimumChildAge !==
                  null && (
                  <InformationCard
                    title="Enfants"
                    color={
                      invitationColor
                    }
                    backgroundColor={
                      softColor
                    }
                    borderColor={
                      borderColor
                    }
                    borderRadius={
                      informationRadius
                    }
                  >
                    Les enfants sont
                    invités à partir de{" "}
                    {
                      event.minimumChildAge
                    }{" "}
                    ans.
                  </InformationCard>
                )}

              {event.childrenPolicy ===
                "allowed" && (
                <InformationCard
                  title="Enfants"
                  color={invitationColor}
                  backgroundColor={
                    softColor
                  }
                  borderColor={
                    borderColor
                  }
                  borderRadius={
                    informationRadius
                  }
                >
                  Les enfants sont les
                  bienvenus à cet
                  événement.
                </InformationCard>
              )}

              {event.dressCode && (
                <InformationCard
                  title="Dress code"
                  color={invitationColor}
                  backgroundColor={
                    softColor
                  }
                  borderColor={
                    borderColor
                  }
                  borderRadius={
                    informationRadius
                  }
                >
                  {event.dressCode}
                </InformationCard>
              )}

              {event.importantInfo && (
                <InformationCard
                  title="Informations importantes"
                  color={invitationColor}
                  backgroundColor={
                    softColor
                  }
                  borderColor={
                    borderColor
                  }
                  borderRadius={
                    informationRadius
                  }
                >
                  <span className="whitespace-pre-line">
                    {
                      event.importantInfo
                    }
                  </span>
                </InformationCard>
              )}
            </div>

            {/* Séparation */}
            <div className="mt-10">
              <div
                className="mx-auto h-px w-full max-w-lg"
                style={{
                  backgroundColor:
                    borderColor,
                }}
              />

              <p
                className="mt-8 text-xs font-bold uppercase tracking-[0.18em]"
                style={{
                  color: invitationColor,
                }}
              >
                Réponse à l’invitation
              </p>
            </div>

            {/* Formulaire de réponse */}
            <ResponseButtons
              token={guest.token}
              initialStatus={
                guest.status
              }
              maxCompanions={
                guest.maxCompanions
              }
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
                  label:
                    question.label,
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

            {/* Pied de page */}
            <div
              className="mt-10 border-t pt-6"
              style={{
                borderColor,
              }}
            >
              <p className="text-xs text-gray-400 sm:text-sm">
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

function EventDetail({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="min-w-0 px-4 py-5">
      <p
        className="text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color }}
      >
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function InformationCard({
  title,
  children,
  color,
  backgroundColor,
  borderColor,
  borderRadius,
}: {
  title: string;
  children: React.ReactNode;
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderRadius: string;
}) {
  return (
    <div
      className="overflow-hidden border p-5"
      style={{
        backgroundColor,
        borderColor,
        borderRadius,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-1 block h-8 w-1 shrink-0 rounded-full"
          style={{
            backgroundColor: color,
          }}
        />

        <div className="min-w-0">
          <p className="font-semibold text-gray-950">
            {title}
          </p>

          <div className="mt-2 break-words text-sm leading-6 text-gray-600">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}