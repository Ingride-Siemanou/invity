import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/session";
import { db } from "@/prisma/db";
import LogoutButton from "./logout-button";

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

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de bord
            </h1>

            <p className="mt-2 text-gray-600">
              Bienvenue {session.firstName} sur votre espace Invity.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard/events/new"
              className="rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700"
            >
              + Créer un événement
            </Link>

            <LogoutButton />
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Mes événements
            </h2>

            <span className="text-sm text-gray-500">
              {events.length} événement{events.length > 1 ? "s" : ""}
            </span>
          </div>

          {events.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900">
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
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-3xl bg-white p-6 shadow-sm"
                >
                  <div className="text-sm font-medium text-pink-600">
                    {event.eventDate}
                  </div>

                  <h3 className="mt-2 text-xl font-bold text-gray-900">
                    {event.title}
                  </h3>

                  {event.eventTime && (
                    <p className="mt-3 text-sm text-gray-600">
                      Heure : {event.eventTime}
                    </p>
                  )}

                  {event.location && (
                    <p className="mt-1 text-sm text-gray-600">
                      Lieu : {event.location}
                    </p>
                  )}

                  {event.description && (
                    <p className="mt-4 text-sm leading-6 text-gray-500">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}