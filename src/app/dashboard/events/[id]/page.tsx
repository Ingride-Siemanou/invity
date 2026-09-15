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

  return "🎉";
}

export default async function EventPage({ params }: EventPageProps) {
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
        guest.companionCount +
        guest.childrenCount,
      0
    );

  const totalCompanions = guests
    .filter((guest) => guest.status === "accepted")
    .reduce(
      (total, guest) => total + guest.companionCount,
      0
    );

  const totalChildren = guests
    .filter((guest) => guest.status === "accepted")
    .reduce(
      (total, guest) => total + guest.childrenCount,
      0
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-pink-600"
            >
              Invity
            </Link>

            <p className="mt-1 text-xs text-gray-500">
              Créez. Invitez. Célébrez.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="p-7 sm:p-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-3xl">
                  {getEventIcon(event.title)}
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
                    Votre événement
                  </p>

                  <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                    {event.title}
                  </h1>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                    <span>📅 {event.eventDate}</span>

                    {event.eventTime && (
                      <span>🕐 {event.eventTime}</span>
                    )}

                    {event.location && (
                      <span>📍 {event.location}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/dashboard/events/${event.id}/guests`}
                  className="rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
                >
                  Gérer les invités
                </Link>

                <Link
                  href={`/dashboard/events/${event.id}/questions`}
                  className="rounded-xl border border-pink-200 bg-pink-50 px-5 py-3 text-sm font-semibold text-pink-700 transition hover:bg-pink-100"
                >
                  Gérer les questions
                </Link>
              </div>
            </div>

            {event.description && (
              <p className="mt-7 max-w-3xl leading-7 text-gray-600">
                {event.description}
              </p>
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Réponses des invités
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Suivez l’évolution des réponses pour cet événement.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Invités
              </p>

              <p className="mt-3 text-3xl font-bold text-gray-900">
                {guests.length}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-green-700">
                Présents
              </p>

              <p className="mt-3 text-3xl font-bold text-green-700">
                {accepted}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-red-700">
                Absents
              </p>

              <p className="mt-3 text-3xl font-bold text-red-700">
                {declined}
              </p>
            </div>

            <div className="rounded-2xl bg-yellow-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-yellow-700">
                En attente
              </p>

              <p className="mt-3 text-3xl font-bold text-yellow-700">
                {pending + maybe}
              </p>

              {maybe > 0 && (
                <p className="mt-1 text-xs text-yellow-700">
                  dont {maybe} indécis
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-pink-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-pink-700">
                Personnes attendues
              </p>

              <p className="mt-3 text-3xl font-bold text-pink-700">
                {peopleExpected}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Progression des réponses
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {responded} réponse
                  {responded > 1 ? "s" : ""} reçue
                  {responded > 1 ? "s" : ""} sur {guests.length}.
                </p>
              </div>

              <span className="rounded-full bg-pink-50 px-4 py-2 text-sm font-bold text-pink-700">
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

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Invités présents
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {accepted}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Accompagnants
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {totalCompanions}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Enfants
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {totalChildren}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Actions rapides
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Gérez votre événement.
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href={`/dashboard/events/${event.id}/guests`}
                className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 transition hover:border-pink-200 hover:bg-pink-50"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    👥 Invités
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Ajouter et suivre les réponses
                  </p>
                </div>

                <span className="text-pink-600">→</span>
              </Link>

              <Link
                href={`/dashboard/events/${event.id}/questions`}
                className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 transition hover:border-pink-200 hover:bg-pink-50"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    ❓ Questions
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Personnaliser le formulaire
                  </p>
                </div>

                <span className="text-pink-600">→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Informations de l’événement
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Les informations communiquées à vos invités.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-xl">
                  👶
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Enfants
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {getChildrenRule(
                      event.childrenPolicy,
                      event.minimumChildAge
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-xl">
                  👗
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Dress code
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {event.dressCode || "Aucun dress code indiqué"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-xl">
                  📌
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Informations importantes
                  </p>

                  <p className="mt-1 whitespace-pre-line leading-7 text-gray-900">
                    {event.importantInfo ||
                      "Aucune information importante ajoutée."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 border-t border-gray-200 pt-6">
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