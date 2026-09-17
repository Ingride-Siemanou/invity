import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/session";
import { db } from "@/prisma/db";
import LogoutButton from "./logout-button";

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

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("invity_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifySessionToken(token);

  if (!session) {
    redirect("/login");
  }

  const events = await db.orm.public.Event
    .where({ userId: session.userId })
    .all();

  const eventsWithStats = await Promise.all(
    events.map(async (event) => {
      const guests = await db.orm.public.Guest
        .where({ eventId: event.id })
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

      const companionsExpected = guests
        .filter((guest) => guest.status === "accepted")
        .reduce(
          (total, guest) =>
            total + safeNumber(guest.companionCount),
          0
        );

      const childrenExpected = guests
        .filter((guest) => guest.status === "accepted")
        .reduce(
          (total, guest) =>
            total + safeNumber(guest.childrenCount),
          0
        );

      const responded = accepted + declined + maybe;

      const responseRate =
        guests.length > 0
          ? Math.round((responded / guests.length) * 100)
          : 0;

      return {
        event,
        guestsCount: guests.length,
        accepted,
        declined,
        maybe,
        pending,
        peopleExpected,
        companionsExpected,
        childrenExpected,
        responseRate,
      };
    })
  );

  const totalGuests = eventsWithStats.reduce(
    (total, item) => total + item.guestsCount,
    0
  );

  const totalAccepted = eventsWithStats.reduce(
    (total, item) => total + item.accepted,
    0
  );

  const totalDeclined = eventsWithStats.reduce(
    (total, item) => total + item.declined,
    0
  );

  const totalMaybe = eventsWithStats.reduce(
    (total, item) => total + item.maybe,
    0
  );

  const totalWaiting = eventsWithStats.reduce(
    (total, item) => total + item.pending + item.maybe,
    0
  );

  const totalPeopleExpected = eventsWithStats.reduce(
    (total, item) => total + safeNumber(item.peopleExpected),
    0
  );

  const totalCompanionsExpected = eventsWithStats.reduce(
    (total, item) =>
      total + safeNumber(item.companionsExpected),
    0
  );

  const totalChildrenExpected = eventsWithStats.reduce(
    (total, item) =>
      total + safeNumber(item.childrenExpected),
    0
  );

  const totalResponded =
    totalAccepted + totalDeclined + totalMaybe;

  const globalResponseRate =
    totalGuests > 0
      ? Math.round((totalResponded / totalGuests) * 100)
      : 0;

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

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/events/new"
              className="rounded-full bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 sm:px-5"
            >
              <span className="sm:hidden">Créer</span>

              <span className="hidden sm:inline">
                Créer un événement
              </span>
            </Link>

            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Introduction */}
        <section className="relative overflow-hidden rounded-[28px] bg-gray-950 px-5 py-8 text-white shadow-xl sm:rounded-[36px] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-600/20 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-pink-300">
                Tableau de bord organisateur
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Bonjour {session.firstName}
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-gray-300 sm:text-base sm:leading-7">
                Retrouvez vos événements, suivez les réponses de
                vos invités et gardez une vision claire des
                personnes attendues.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                <p className="text-xs text-gray-400">
                  Événements
                </p>

                <p className="mt-1 text-xl font-bold">
                  {events.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                <p className="text-xs text-gray-400">
                  Taux de réponse
                </p>

                <p className="mt-1 text-xl font-bold text-pink-300">
                  {globalResponseRate}%
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistiques générales */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Invités"
            value={totalGuests}
          />

          <StatCard
            label="Présents"
            value={totalAccepted}
            variant="green"
          />

          <StatCard
            label="Absents"
            value={totalDeclined}
            variant="red"
          />

          <StatCard
            label="En attente"
            value={totalWaiting}
            variant="yellow"
          />

          <StatCard
            label="Personnes attendues"
            value={totalPeopleExpected}
            variant="pink"
          />

          <StatCard
            label="Événements"
            value={events.length}
            variant="purple"
          />
        </section>

        {/* Détail des personnes attendues */}
        {totalAccepted > 0 && (
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <SummaryCard
              value={totalAccepted}
              label="invités présents"
              accent="green"
            />

            <SummaryCard
              value={totalCompanionsExpected}
              label="accompagnants"
              accent="blue"
            />

            <SummaryCard
              value={totalChildrenExpected}
              label="enfants"
              accent="purple"
            />
          </section>
        )}

        {/* Événements */}
        <section className="mt-10 sm:mt-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
                Votre espace
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                Mes événements
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                Consultez rapidement l’état des réponses et
                accédez aux outils de chaque événement.
              </p>
            </div>

            <Link
              href="/dashboard/events/new"
              className="inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-pink-200 hover:text-pink-600 sm:w-auto"
            >
              Nouvel événement
            </Link>
          </div>

          {eventsWithStats.length === 0 ? (
            <div className="mt-6 overflow-hidden rounded-[28px] border border-gray-100 bg-white px-5 py-12 text-center shadow-sm sm:px-10 sm:py-16">
              <div className="mx-auto h-1 w-16 rounded-full bg-pink-500" />

              <h3 className="mt-6 text-xl font-bold text-gray-900">
                Votre premier événement vous attend
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Créez votre événement, ajoutez vos invités et
                commencez à recevoir leurs réponses.
              </p>

              <Link
                href="/dashboard/events/new"
                className="mt-6 inline-flex rounded-full bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
              >
                Créer mon premier événement
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {eventsWithStats.map(
                ({
                  event,
                  guestsCount,
                  accepted,
                  declined,
                  maybe,
                  pending,
                  peopleExpected,
                  companionsExpected,
                  childrenExpected,
                  responseRate,
                }) => (
                  <article
                    key={event.id}
                    className="group overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="mb-3 h-1 w-10 rounded-full bg-pink-500" />

                          <h3 className="break-words text-lg font-bold text-gray-950 sm:text-xl">
                            {event.title}
                          </h3>

                          <div className="mt-2 space-y-1.5 text-sm text-gray-500">
                            <p>
                              {formatEventDate(event.eventDate)}
                              {event.eventTime
                                ? ` • ${event.eventTime}`
                                : ""}
                            </p>

                            {event.location && (
                              <p className="break-words">
                                {event.location}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="w-fit shrink-0 rounded-full bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-700">
                          {responseRate}% répondu
                        </span>
                      </div>

                      {event.description && (
                        <p className="mt-5 line-clamp-2 text-sm leading-6 text-gray-500">
                          {event.description}
                        </p>
                      )}

                      {/* Progression */}
                      <div className="mt-6 rounded-2xl bg-gray-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              Réponses reçues
                            </p>

                            <p className="mt-1 text-sm font-bold text-gray-900">
                              {accepted + declined + maybe} sur{" "}
                              {guestsCount}
                            </p>
                          </div>

                          <p className="text-lg font-bold text-pink-600">
                            {responseRate}%
                          </p>
                        </div>

                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-pink-500 transition-all"
                            style={{
                              width: `${responseRate}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Statistiques de l'événement */}
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <MiniStat
                          label="Invités"
                          value={guestsCount}
                        />

                        <MiniStat
                          label="Présents"
                          value={accepted}
                          variant="green"
                        />

                        <MiniStat
                          label="En attente"
                          value={pending + maybe}
                          variant="yellow"
                        />

                        <MiniStat
                          label="Personnes"
                          value={peopleExpected}
                          variant="pink"
                        />
                      </div>

                      {(companionsExpected > 0 ||
                        childrenExpected > 0) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {companionsExpected > 0 && (
                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                              {companionsExpected} accompagnant
                              {companionsExpected > 1 ? "s" : ""}
                            </span>
                          )}

                          {childrenExpected > 0 && (
                            <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                              {childrenExpected} enfant
                              {childrenExpected > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid border-t border-gray-100 sm:grid-cols-2 lg:grid-cols-4">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="flex items-center justify-center px-4 py-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Voir
                      </Link>

                      <Link
                        href={`/dashboard/events/${event.id}/guests`}
                        className="flex items-center justify-center border-t border-gray-100 px-4 py-4 text-sm font-semibold text-pink-600 transition hover:bg-pink-50 sm:border-l sm:border-t-0"
                      >
                        Invités
                      </Link>

                      <Link
                        href={`/dashboard/events/${event.id}/questions`}
                        className="flex items-center justify-center border-t border-gray-100 px-4 py-4 text-sm font-semibold text-pink-600 transition hover:bg-pink-50 lg:border-l lg:border-t-0"
                      >
                        Questions
                      </Link>

                      <Link
                        href={`/dashboard/events/${event.id}/customize`}
                        className="flex items-center justify-center border-t border-gray-100 px-4 py-4 text-sm font-semibold text-pink-600 transition hover:bg-pink-50 sm:border-l lg:border-t-0"
                      >
                        Personnaliser
                      </Link>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        {/* Aide rapide */}
        {events.length > 0 && (
          <section className="mt-10 rounded-[28px] border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-pink-700">
                  Besoin de préparer un nouvel événement ?
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Créez votre invitation puis ajoutez vos invités
                  et vos questions personnalisées.
                </p>
              </div>

              <Link
                href="/dashboard/events/new"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Créer un événement
              </Link>
            </div>
          </section>
        )}

        <footer className="mt-12 border-t border-gray-200 py-8 text-center text-xs text-gray-400">
          Invity — Créez. Invitez. Célébrez.
        </footer>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number;
  variant?:
    | "default"
    | "green"
    | "red"
    | "yellow"
    | "pink"
    | "purple";
}) {
  const styles = {
    default: {
      card: "bg-white",
      line: "bg-gray-300",
      value: "text-gray-950",
    },

    green: {
      card: "bg-green-50/70",
      line: "bg-green-500",
      value: "text-green-700",
    },

    red: {
      card: "bg-red-50/70",
      line: "bg-red-500",
      value: "text-red-700",
    },

    yellow: {
      card: "bg-yellow-50/70",
      line: "bg-yellow-500",
      value: "text-yellow-700",
    },

    pink: {
      card: "bg-pink-50/80",
      line: "bg-pink-500",
      value: "text-pink-700",
    },

    purple: {
      card: "bg-purple-50/70",
      line: "bg-purple-500",
      value: "text-purple-700",
    },
  };

  const style = styles[variant];

  return (
    <div
      className={`min-w-0 rounded-2xl border border-white/70 p-4 shadow-sm sm:p-5 ${style.card}`}
    >
      <div className={`h-1 w-8 rounded-full ${style.line}`} />

      <p className="mt-4 break-words text-xs font-medium leading-5 text-gray-500 sm:text-sm">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-bold sm:text-3xl ${style.value}`}
      >
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  value,
  label,
  accent = "default",
}: {
  value: number;
  label: string;
  accent?: "default" | "green" | "blue" | "purple";
}) {
  const styles = {
    default: "bg-gray-300",
    green: "bg-green-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className={`h-1 w-8 rounded-full ${styles[accent]}`} />

      <p className="mt-4 text-xl font-bold text-gray-950">
        {value}
      </p>

      <p className="mt-1 break-words text-sm text-gray-500">
        {label}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number;
  variant?: "default" | "green" | "yellow" | "pink";
}) {
  const styles = {
    default: "bg-gray-50 text-gray-900",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    pink: "bg-pink-50 text-pink-700",
  };

  return (
    <div
      className={`min-w-0 rounded-xl p-3 ${styles[variant]}`}
    >
      <p className="truncate text-[11px] opacity-70 sm:text-xs">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}