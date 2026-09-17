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

function getEventTypeLabel(eventType: string) {
  switch (eventType) {
    case "wedding":
      return "Mariage";
    case "birthday":
      return "Anniversaire";
    case "baptism":
      return "Baptême";
    case "ceremony":
      return "Cérémonie";
    case "party":
      return "Fête";
    case "professional":
      return "Événement professionnel";
    default:
      return "Événement";
  }
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
    <main className="min-h-screen bg-[#faf9fc] text-gray-900">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/90 backdrop-blur-xl">
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
            className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-pink-200 hover:text-pink-600 sm:px-5 sm:text-sm"
          >
            Tableau de bord
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Présentation */}
        <section className="relative overflow-hidden rounded-[28px] border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-purple-50 shadow-sm sm:rounded-[36px]">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />

          <div className="relative p-5 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 max-w-3xl">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-pink-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-pink-700">
                    {getEventTypeLabel(event.eventType)}
                  </span>

                  <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                    {responseRate}% de réponses
                  </span>
                </div>

                <h1 className="mt-5 break-words text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                  {event.title}
                </h1>

                <div className="mt-5 flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:gap-x-6">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Date
                    </span>

                    <span className="mt-1 block font-semibold text-gray-800">
                      {formatEventDate(event.eventDate)}
                    </span>
                  </div>

                  {event.eventTime && (
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Heure
                      </span>

                      <span className="mt-1 block font-semibold text-gray-800">
                        {event.eventTime}
                      </span>
                    </div>
                  )}

                  {event.location && (
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Lieu
                      </span>

                      <span className="mt-1 block break-words font-semibold text-gray-800">
                        {event.location}
                      </span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="mt-6 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Actions principales */}
              <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[390px]">
                <Link
                  href={`/dashboard/events/${event.id}/edit`}
                  className="inline-flex items-center justify-center rounded-2xl border border-pink-200 bg-white px-5 py-3.5 text-sm font-semibold text-pink-700 transition hover:bg-pink-50 sm:col-span-2"
                >
                  Modifier l&apos;événement
                </Link>

                <Link
                  href={`/dashboard/events/${event.id}/guests`}
                  className="inline-flex items-center justify-center rounded-2xl bg-pink-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700"
                >
                  Gérer les invités
                </Link>

                <Link
                  href={`/dashboard/events/${event.id}/questions`}
                  className="inline-flex items-center justify-center rounded-2xl border border-purple-200 bg-purple-50 px-5 py-3.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
                >
                  Gérer les questions
                </Link>

                <Link
                  href={`/dashboard/events/${event.id}/customize`}
                  className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 sm:col-span-2"
                >
                  Personnaliser l&apos;invitation
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
              Suivez l&apos;évolution des réponses pour cet événement.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <StatCard
              label="Invités"
              value={guests.length}
              variant="default"
            />

            <StatCard
              label="Présents"
              value={accepted}
              variant="green"
            />

            <StatCard
              label="Absents"
              value={declined}
              variant="red"
            />

            <StatCard
              label="En attente"
              value={pending + maybe}
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
              variant="pink"
              wideOnMobile
            />
          </div>
        </section>

        {/* Progression */}
        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-[28px] border border-purple-100 bg-white p-5 shadow-sm sm:p-7 lg:col-span-2">
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
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
                style={{
                  width: `${responseRate}%`,
                }}
              />
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <SummaryCard
                label="Invités présents"
                value={accepted}
                variant="green"
              />

              <SummaryCard
                label="Accompagnants"
                value={totalCompanions}
                variant="blue"
              />

              <SummaryCard
                label="Enfants"
                value={totalChildren}
                variant="purple"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50 p-4">
              <p className="text-xs font-medium text-pink-700">
                Total prévu pour l&apos;événement
              </p>

              <p className="mt-1 text-3xl font-bold text-pink-700">
                {peopleExpected}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                invités présents + accompagnants + enfants
              </p>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-bold text-gray-950">
              Actions rapides
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Gérez les différentes parties de votre événement.
            </p>

            <div className="mt-5 space-y-3">
              <QuickAction
                href={`/dashboard/events/${event.id}/edit`}
                title="Modifier l’événement"
                description="Modifier la date, le lieu et les informations générales"
                variant="pink"
              />

              <QuickAction
                href={`/dashboard/events/${event.id}/guests`}
                title="Invités"
                description="Ajouter et suivre les réponses"
                variant="pink"
              />

              <QuickAction
                href={`/dashboard/events/${event.id}/questions`}
                title="Questions"
                description="Personnaliser le formulaire"
                variant="purple"
              />

              <QuickAction
                href={`/dashboard/events/${event.id}/customize`}
                title="Personnalisation"
                description="Modifier le thème, les couleurs et la photo"
                variant="blue"
              />
            </div>
          </div>
        </section>

        {/* Informations */}
        <section className="mt-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600">
              Configuration
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
              Informations de l&apos;événement
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Les informations communiquées à vos invités.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoCard
              label="Enfants"
              value={getChildrenRule(
                event.childrenPolicy,
                event.minimumChildAge
              )}
              variant="blue"
            />

            <InfoCard
              label="Dress code"
              value={
                event.dressCode ||
                "Aucun dress code indiqué"
              }
              variant="purple"
            />

            <div className="rounded-[28px] border border-amber-100 bg-gradient-to-br from-amber-50/70 to-white p-5 shadow-sm sm:p-6 md:col-span-2">
              <div className="h-1 w-10 rounded-full bg-amber-400" />

              <p className="mt-5 text-sm font-medium text-gray-500">
                Informations importantes
              </p>

              <p className="mt-2 break-words whitespace-pre-line leading-7 text-gray-900">
                {event.importantInfo ||
                  "Aucune information importante ajoutée."}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10 border-t border-gray-200 py-7">
          <Link
            href="/dashboard"
            className="inline-flex rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-pink-200 hover:text-pink-600"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  variant = "default",
  note,
  wideOnMobile = false,
}: {
  label: string;
  value: number;
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
      card: "bg-white border-gray-100",
      line: "bg-gray-300",
      value: "text-gray-950",
    },
    green: {
      card: "bg-green-50/70 border-green-100",
      line: "bg-green-500",
      value: "text-green-700",
    },
    red: {
      card: "bg-red-50/70 border-red-100",
      line: "bg-red-500",
      value: "text-red-700",
    },
    yellow: {
      card: "bg-yellow-50/70 border-yellow-100",
      line: "bg-yellow-500",
      value: "text-yellow-700",
    },
    pink: {
      card: "bg-pink-50/80 border-pink-100",
      line: "bg-pink-500",
      value: "text-pink-700",
    },
  };

  const style = styles[variant];

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${
        style.card
      } ${
        wideOnMobile ? "col-span-2 lg:col-span-1" : ""
      }`}
    >
      <div className={`h-1 w-8 rounded-full ${style.line}`} />

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
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "green" | "blue" | "purple";
}) {
  const styles = {
    green: {
      card: "bg-green-50 border-green-100",
      line: "bg-green-500",
      value: "text-green-700",
    },
    blue: {
      card: "bg-blue-50 border-blue-100",
      line: "bg-blue-500",
      value: "text-blue-700",
    },
    purple: {
      card: "bg-purple-50 border-purple-100",
      line: "bg-purple-500",
      value: "text-purple-700",
    },
  };

  const style = styles[variant];

  return (
    <div className={`rounded-2xl border p-4 ${style.card}`}>
      <div className={`h-1 w-8 rounded-full ${style.line}`} />

      <p className="mt-4 text-sm text-gray-500">
        {label}
      </p>

      <p className={`mt-1 text-2xl font-bold ${style.value}`}>
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  variant,
}: {
  href: string;
  title: string;
  description: string;
  variant: "pink" | "purple" | "blue";
}) {
  const styles = {
    pink: "border-pink-100 bg-pink-50/50 hover:bg-pink-50",
    purple:
      "border-purple-100 bg-purple-50/50 hover:bg-purple-50",
    blue: "border-blue-100 bg-blue-50/50 hover:bg-blue-50",
  };

  return (
    <Link
      href={href}
      className={`block rounded-2xl border p-4 transition ${styles[variant]}`}
    >
      <p className="font-semibold text-gray-900">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-gray-500">
        {description}
      </p>
    </Link>
  );
}

function InfoCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: "blue" | "purple";
}) {
  const styles = {
    blue: {
      card: "border-blue-100 bg-gradient-to-br from-blue-50/70 to-white",
      line: "bg-blue-500",
    },
    purple: {
      card: "border-purple-100 bg-gradient-to-br from-purple-50/70 to-white",
      line: "bg-purple-500",
    },
  };

  const style = styles[variant];

  return (
    <div
      className={`rounded-[28px] border p-5 shadow-sm sm:p-6 ${style.card}`}
    >
      <div className={`h-1 w-10 rounded-full ${style.line}`} />

      <p className="mt-5 text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 break-words font-semibold leading-6 text-gray-900">
        {value}
      </p>
    </div>
  );
}