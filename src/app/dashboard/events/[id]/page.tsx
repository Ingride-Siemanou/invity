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

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-pink-600 hover:text-pink-700"
        >
          ← Retour au tableau de bord
        </Link>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
                Invity
              </p>

              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                {event.title}
              </h1>

              <p className="mt-2 text-gray-500">
                Gérez votre événement et vos invités.
              </p>
            </div>

            <Link
              href={`/dashboard/events/${event.id}/guests`}
              className="rounded-xl bg-pink-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-pink-700"
            >
              Gérer les invités
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-500">
                Date
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {event.eventDate}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-500">
                Heure
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {event.eventTime || "Non renseignée"}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5 sm:col-span-2">
              <p className="text-sm font-medium text-gray-500">
                Lieu
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {event.location || "Non renseigné"}
              </p>
            </div>
          </div>

          {event.description && (
            <div className="mt-6 rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-medium text-gray-500">
                Description
              </p>

              <p className="mt-2 whitespace-pre-line text-gray-800">
                {event.description}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
              Paramètres
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Règles de l’événement
            </h2>

            <p className="mt-2 text-gray-500">
              Ces informations sont affichées aux invités sur leur invitation.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-500">
                Enfants
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {getChildrenRule(
                  event.childrenPolicy,
                  event.minimumChildAge
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-500">
                Dress code
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {event.dressCode || "Aucun dress code renseigné"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-gray-50 p-5">
            <p className="text-sm font-medium text-gray-500">
              Informations importantes
            </p>

            <p className="mt-2 whitespace-pre-line text-gray-800">
              {event.importantInfo ||
                "Aucune information importante renseignée"}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-pink-50 p-8">
          <h2 className="text-xl font-bold text-gray-900">
            Invitations
          </h2>

          <p className="mt-2 text-gray-600">
            Ajoutez vos invités, définissez leurs accompagnants et consultez
            leurs réponses.
          </p>

          <Link
            href={`/dashboard/events/${event.id}/guests`}
            className="mt-5 inline-block rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
          >
            Gérer les invités →
          </Link>
        </div>
      </div>
    </main>
  );
}