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

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="text-3xl font-bold text-pink-600">
            Invity
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-pink-600">
            Vous êtes invité(e)
          </p>

          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            {event.title}
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            Bonjour{" "}
            <span className="font-semibold text-gray-900">
              {guest.firstName} {guest.lastName}
            </span>
          </p>

          <div className="mt-8 rounded-2xl bg-gray-50 p-6">
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

          {event.description && (
            <p className="mt-8 leading-7 text-gray-600">
              {event.description}
            </p>
          )}

          <ResponseButtons
            token={guest.token}
            initialStatus={guest.status}
          />

          <div className="mt-10 border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-400">
              Invity — Créez. Invitez. Célébrez.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}