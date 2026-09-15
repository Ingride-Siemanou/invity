import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/session";
import { db } from "@/prisma/db";
import LogoutButton from "./logout-button";

function getEventTypeIcon(title: string) {
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

  return "🎉";
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
            guest.companionCount +
            guest.childrenCount,
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

  const totalWaiting = eventsWithStats.reduce(
    (total, item) => total + item.pending + item.maybe,
    0
  );

  const totalPeopleExpected = eventsWithStats.reduce(
    (total, item) => total + item.peopleExpected,
    0
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-pink-600"
            >
              Invity
            </Link>

            <p className="mt-1 text-sm text-gray-500">
              Créez. Invitez. Célébrez.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/events/new"
              className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
            >
              + Créer un événement
            </Link>

            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <section>
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
            Tableau de bord
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Bonjour {session.firstName} 👋
          </h1>

          <p className="mt-2 text-gray-500">
            Voici un aperçu de vos événements et des réponses
            de vos invités.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Événements
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {events.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Invités
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {totalGuests}
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-green-700">
              Présents
            </p>

            <p className="mt-3 text-3xl font-bold text-green-700">
              {totalAccepted}
            </p>
          </div>

          <div className="rounded-2xl bg-red-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-red-700">
              Absents
            </p>

            <p className="mt-3 text-3xl font-bold text-red-700">
              {totalDeclined}
            </p>
          </div>

          <div className="rounded-2xl bg-yellow-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-yellow-700">
              En attente
            </p>

            <p className="mt-3 text-3xl font-bold text-yellow-700">
              {totalWaiting}
            </p>
          </div>

          <div className="rounded-2xl bg-pink-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-pink-700">
              Personnes attendues
            </p>

            <p className="mt-3 text-3xl font-bold text-pink-700">
              {totalPeopleExpected}
            </p>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Mes événements
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Suivez les réponses de chaque événement.
              </p>
            </div>

            <span className="text-sm text-gray-500">
              {events.length} événement
              {events.length > 1 ? "s" : ""}
            </span>
          </div>

          {eventsWithStats.length === 0 ? (
            <div className="mt-6 rounded-3xl bg-white p-10 text-center shadow-sm">
              <div className="text-5xl">🎉</div>

              <h3 className="mt-5 text-xl font-semibold text-gray-900">
                Aucun événement pour le moment
              </h3>

              <p className="mt-2 text-gray-500">
                Créez votre première invitation avec Invity.
              </p>

              <Link
                href="/dashboard/events/new"
                className="mt-6 inline-block rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700"
              >
                Créer mon premier événement
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {eventsWithStats.map(
                ({
                  event,
                  guestsCount,
                  accepted,
                  declined,
                  maybe,
                  pending,
                  peopleExpected,
                  responseRate,
                }) => (
                  <article
                    key={event.id}
                    className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
                            {getEventTypeIcon(event.title)}
                          </div>

                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {event.title}
                            </h3>

                            <div className="mt-2 space-y-1 text-sm text-gray-500">
                              <p>
                                📅 {event.eventDate}
                                {event.eventTime
                                  ? ` à ${event.eventTime}`
                                  : ""}
                              </p>

                              {event.location && (
                                <p>📍 {event.location}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">
                          {responseRate}% répondu
                        </span>
                      </div>

                      {event.description && (
                        <p className="mt-5 line-clamp-2 text-sm leading-6 text-gray-500">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs text-gray-500">
                            Invités
                          </p>
                          <p className="mt-1 font-bold text-gray-900">
                            {guestsCount}
                          </p>
                        </div>

                        <div className="rounded-xl bg-green-50 p-3">
                          <p className="text-xs text-green-700">
                            Présents
                          </p>
                          <p className="mt-1 font-bold text-green-700">
                            {accepted}
                          </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs text-gray-500">
                            En attente
                          </p>
                          <p className="mt-1 font-bold text-gray-900">
                            {pending + maybe}
                          </p>
                        </div>

                        <div className="rounded-xl bg-pink-50 p-3">
                          <p className="text-xs text-pink-700">
                            Personnes
                          </p>
                          <p className="mt-1 font-bold text-pink-700">
                            {peopleExpected}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-600">
                            Réponses reçues
                          </span>

                          <span className="font-semibold text-gray-900">
                            {accepted + declined + maybe} /{" "}
                            {guestsCount}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-pink-500 transition-all"
                            style={{
                              width: `${responseRate}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid border-t border-gray-100 sm:grid-cols-3">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="px-4 py-4 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Voir l’événement
                      </Link>

                      <Link
                        href={`/dashboard/events/${event.id}/guests`}
                        className="border-t border-gray-100 px-4 py-4 text-center text-sm font-semibold text-pink-600 transition hover:bg-pink-50 sm:border-l sm:border-t-0"
                      >
                        Gérer les invités
                      </Link>

                      <Link
                        href={`/dashboard/events/${event.id}/questions`}
                        className="border-t border-gray-100 px-4 py-4 text-center text-sm font-semibold text-pink-600 transition hover:bg-pink-50 sm:border-l sm:border-t-0"
                      >
                        Questions
                      </Link>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}