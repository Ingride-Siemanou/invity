import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { verifySessionToken } from "@/lib/session";
import { db } from "@/prisma/db";

type EventPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getChildrenRule(
  childrenPolicy: string,
  minimumChildAge: number | null
) {
  if (childrenPolicy === "not_allowed") {
    return "Enfants non autorisés";
  }

  if (childrenPolicy === "minimum_age") {
    return minimumChildAge !== null
      ? `Enfants autorisés à partir de ${minimumChildAge} ans`
      : "Enfants avec âge minimum";
  }

  return "Enfants autorisés";
}

function getEventIcon(title: string) {
  const normalizedTitle = title.toLowerCase();

  if (
    normalizedTitle.includes("mariage") ||
    normalizedTitle.includes("wedding")
  ) {
    return "💍";
  }

  if (
    normalizedTitle.includes("baptême") ||
    normalizedTitle.includes("bapteme")
  ) {
    return "🕊️";
  }

  if (
    normalizedTitle.includes("anniversaire") ||
    normalizedTitle.includes("birthday")
  ) {
    return "🎂";
  }

  if (
    normalizedTitle.includes("professionnel") ||
    normalizedTitle.includes("entreprise")
  ) {
    return "💼";
  }

  if (
    normalizedTitle.includes("cérémonie") ||
    normalizedTitle.includes("ceremonie")
  ) {
    return "✨";
  }

  return "🎉";
}

function formatEventDate(date: string) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function safeNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

export default async function EventPage({
  params,
}: EventPageProps) {
  const { id } = await params;
  const eventId = Number(id);

  if (Number.isNaN(eventId)) {
    notFound();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("invity_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifySessionToken(token);

  if (!session) {
    redirect("/login");
  }

  const event = await db.orm.public.Event
    .where({
      id: eventId,
      userId: session.userId,
    })
    .first();

  if (!event) {
    notFound();
  }

  const guests = await db.orm.public.Guest
    .where({ eventId })
    .all();

  const accepted = guests.filter(
    (guest) => guest.status === "accepted"
  ).length;

  const declined = guests.filter(
    (guest) => guest.status === "declined"
  ).length;

  const maybe = guests.filter(
    (guest) => guest.status === "maybe"
  ).length;

  const pending = guests.filter(
    (guest) => guest.status === "pending"
  ).length;

  const responded = accepted + declined + maybe;

  const responseRate =
    guests.length > 0
      ? Math.round((responded / guests.length) * 100)
      : 0;

  const peopleExpected = guests
    .filter((guest) => guest.status === "accepted")
    .reduce(
      (total, guest) =>
        total +
        1 +
        safeNumber(guest.companionCount) +
        safeNumber(guest.childrenCount),
      0
    );

  const totalCompanions = guests
    .filter((guest) => guest.status === "accepted")
    .reduce(
      (total, guest) =>
        total + safeNumber(guest.companionCount),
      0
    );

  const totalChildren = guests
    .filter((guest) => guest.status === "accepted")
    .reduce(
      (total, guest) =>
        total + safeNumber(guest.childrenCount),
      0
    );

  return (
    <main className="min-h-screen bg-[#f8f8fb] text-gray-900">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="min-w-0">
            <div className="text-2xl font-bold tracking-tight text-pink-600">
              Invity
            </div>

            <div className="hidden text-[10px] font-medium tracking-wide text-gray-400 sm:block">
              Créez. Invitez. Célébrez.
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-pink-200 hover:text-pink-600 sm:px-5 sm:text-sm"
          >
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Présentation événement */}
        <section className="relative overflow-hidden rounded-[28px] bg-gray-950 text-white shadow-xl sm:rounded-[36px]">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-600/20 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative p-5 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl sm:h-16 sm:w-16">
                  {getEventIcon(event.title)}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-300">
                    Votre événement
                  </p>

                  <h1 className="mt-2 break-words text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    {event.title}
                  </h1>

                  <div className="mt-5 flex flex-col gap-2 text-sm text-gray-300 sm:flex-row sm:flex-wrap sm:gap-x-5">
                    <span>
                      📅 {formatEventDate(event.eventDate)}
                    </span>

                    {event.eventTime && (
                      <span>🕐 {event.eventTime}</span>
                    )}

                    {event.location && (
                      <span className="break-words">
                        📍 {event.location}
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:w-auto">
                <Link
                  href={`/dashboard/events/${event.id}/guests`}
                  className="inline-flex items-center justify-center rounded-full bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-500"
                >
                  👥 Gérer les invités
                </Link>

                <Link
                  href={`/dashboard/events/${event.id}/questions`}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  ❓ Gérer les questions
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Réponses */}
        <section className="mt-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
              Suivi
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
              Réponses des invités
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Suivez l’évolution des réponses pour cet événement.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <StatCard
              label="Invités"
              value={guests.length}
              icon="👥"
            />

            <StatCard
              label="Présents"
              value={accepted}
              icon="✓"
              variant="green"
            />

            <StatCard
              label="Absents"
              value={declined}
              icon="✕"
              variant="red"
            />

            <StatCard
              label="En attente"
              value={pending + maybe}
              icon="⏳"
              variant="yellow"
              note={
                maybe > 0
                  ? `dont ${maybe} indécis`
                  : undefined
              }
            />

            <StatCard
              label="Personnes attendues"
              value={peopleExpected}
              icon="🎟️"
              variant="pink"
              wideOnMobile
            />
          </div>
        </section>

        {/* Progression et actions */}
        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm sm:p-7 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-950">
                  Progression des réponses
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  {responded} réponse
                  {responded > 1 ? "s" : ""} reçue
                  {responded > 1 ? "s" : ""} sur{" "}
                  {guests.length}.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-pink-50 px-3 py-2 text-sm font-bold text-pink-700 sm:px-4">
                {responseRate}%
              </span>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-pink-500 transition-all"
                style={{
                  width: `${responseRate}%`,
                }}
              />
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <SummaryCard
                icon="🙋"
                label="Invités présents"
                value={accepted}
              />

              <SummaryCard
                icon="🤝"
                label="Accompagnants"
                value={totalCompanions}
              />

              <SummaryCard
                icon="👶"
                label="Enfants"
                value={totalChildren}
              />
            </div>

            <div className="mt-5 rounded-2xl bg-pink-50 p-4">
              <p className="text-xs font-medium text-pink-700">
                Total prévu pour l’événement
              </p>

              <p className="mt-1 text-2xl font-bold text-pink-700">
                {peopleExpected}
              </p>

              <p className="mt-1 text-xs leading-5 text-pink-700/70">
                invités présents + accompagnants + enfants
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-bold text-gray-950">
              Actions rapides
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Gérez votre événement.
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href={`/dashboard/events/${event.id}/guests`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 p-4 transition hover:border-pink-200 hover:bg-pink-50"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    👥 Invités
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Ajouter et suivre les réponses
                  </p>
                </div>

                <span className="shrink-0 text-pink-600">
                  →
                </span>
              </Link>

              <Link
                href={`/dashboard/events/${event.id}/questions`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 p-4 transition hover:border-pink-200 hover:bg-pink-50"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    ❓ Questions
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Personnaliser le formulaire
                  </p>
                </div>

                <span className="shrink-0 text-pink-600">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Informations événement */}
        <section className="mt-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
              Configuration
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
              Informations de l’événement
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Les informations communiquées à vos invités.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoCard
              icon="👶"
              label="Enfants"
              value={getChildrenRule(
                event.childrenPolicy,
                event.minimumChildAge
              )}
            />

            <InfoCard
              icon="👗"
              label="Dress code"
              value={
                event.dressCode ||
                "Aucun dress code indiqué"
              }
            />

            <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6 md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-xl">
                  📌
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">
                    Informations importantes
                  </p>

                  <p className="mt-2 break-words whitespace-pre-line leading-7 text-gray-900">
                    {event.importantInfo ||
                      "Aucune information importante ajoutée."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 border-t border-gray-200 py-7">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-pink-600 transition hover:text-pink-700"
          >
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  variant = "default",
  note,
  wideOnMobile = false,
}: {
  label: string;
  value: number;
  icon: string;
  variant?:
    | "default"
    | "green"
    | "red"
    | "yellow"
    | "pink";
  note?: string;
  wideOnMobile?: boolean;
}) {
  const styles = {
    default: {
      card: "bg-white",
      icon: "bg-gray-100 text-gray-700",
      value: "text-gray-950",
    },
    green: {
      card: "bg-green-50/70",
      icon: "bg-green-100 text-green-700",
      value: "text-green-700",
    },
    red: {
      card: "bg-red-50/70",
      icon: "bg-red-100 text-red-700",
      value: "text-red-700",
    },
    yellow: {
      card: "bg-yellow-50/70",
      icon: "bg-yellow-100 text-yellow-700",
      value: "text-yellow-700",
    },
    pink: {
      card: "bg-pink-50/80",
      icon: "bg-pink-100 text-pink-700",
      value: "text-pink-700",
    },
  };

  const style = styles[variant];

  return (
    <div
      className={`rounded-2xl border border-white/70 p-4 shadow-sm sm:p-5 ${
        style.card
      } ${wideOnMobile ? "col-span-2 lg:col-span-1" : ""}`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${style.icon}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs font-medium leading-5 text-gray-500 sm:text-sm">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-bold sm:text-3xl ${style.value}`}
      >
        {value}
      </p>

      {note && (
        <p className="mt-1 text-xs text-gray-500">
          {note}
        </p>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="text-xl">{icon}</div>

      <p className="mt-3 text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-gray-950">
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-xl">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          <p className="mt-2 break-words font-semibold leading-6 text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}