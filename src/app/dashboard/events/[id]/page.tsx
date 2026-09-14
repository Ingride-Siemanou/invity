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
          <div className="text-sm font-medium text-pink-600">
            {event.eventDate}
          </div>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {event.title}
          </h1>

          {event.eventTime && (
            <p className="mt-4 text-gray-600">
              Heure : {event.eventTime}
            </p>
          )}

          {event.location && (
            <p className="mt-2 text-gray-600">
              Lieu : {event.location}
            </p>
          )}

          {event.description && (
            <p className="mt-6 leading-7 text-gray-600">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}