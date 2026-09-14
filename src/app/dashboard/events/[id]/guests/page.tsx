"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Guest = {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  status: string;
  token: string;
};

export default function GuestsPage() {
  const params = useParams();
  const id = params.id as string;

  const [guests, setGuests] = useState<Guest[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGuests, setLoadingGuests] = useState(true);

  useEffect(() => {
    async function loadGuests() {
      try {
        const response = await fetch(`/api/events/${id}/guests`);
        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Impossible de charger les invités.");
          return;
        }

        setGuests(result.guests);
      } catch {
        setError("Impossible de charger les invités.");
      } finally {
        setLoadingGuests(false);
      }
    }

    loadGuests();
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(form);

    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
    };

    try {
      const response = await fetch(`/api/events/${id}/guests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Une erreur est survenue.");
        return;
      }

      setGuests((currentGuests) => [...currentGuests, result.guest]);
      setSuccess("Invité ajouté avec succès !");
      form.reset();
    } catch {
      setError("Impossible d’ajouter l’invité pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/dashboard/events/${id}`}
          className="text-sm font-medium text-pink-600 hover:text-pink-700"
        >
          ← Retour à l’événement
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Invités
          </h1>

          <p className="mt-2 text-gray-600">
            Gérez les invités de votre événement.
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Ajouter un invité
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Prénom
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="Marie"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nom
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Dupont"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Adresse e-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="marie@exemple.fr"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />

              <p className="mt-2 text-xs text-gray-400">
                Facultatif
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-pink-600 py-3.5 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Ajout..." : "Ajouter l’invité"}
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Liste des invités
            </h2>

            <span className="text-sm text-gray-500">
              {guests.length} invité{guests.length > 1 ? "s" : ""}
            </span>
          </div>

          {loadingGuests ? (
            <p className="mt-6 text-gray-500">
              Chargement des invités...
            </p>
          ) : guests.length === 0 ? (
            <p className="mt-6 text-gray-500">
              Aucun invité pour le moment.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {guests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {guest.firstName} {guest.lastName}
                    </p>

                    {guest.email && (
                      <p className="mt-1 text-sm text-gray-500">
                        {guest.email}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <span className="w-fit rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                      En attente de réponse
                    </span>

                    <Link
                      href={`/i/${guest.token}`}
                      target="_blank"
                      className="text-sm font-semibold text-pink-600 hover:text-pink-700"
                    >
                      Ouvrir l’invitation →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}