"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Guest = {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  status: string;
  token: string;
  maxCompanions: number;
  companionCount: number;
};

function getStatusLabel(status: string) {
  if (status === "accepted") {
    return "Présent(e)";
  }

  if (status === "declined") {
    return "Absent(e)";
  }

  if (status === "maybe") {
    return "Je ne sais pas encore";
  }

  return "En attente";
}

function getStatusClass(status: string) {
  if (status === "accepted") {
    return "bg-green-50 text-green-700";
  }

  if (status === "declined") {
    return "bg-red-50 text-red-700";
  }

  if (status === "maybe") {
    return "bg-yellow-50 text-yellow-700";
  }

  return "bg-gray-100 text-gray-600";
}

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
          setError(
            result.error || "Impossible de charger les invités."
          );
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
      maxCompanions: Number(formData.get("maxCompanions")),
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

      setGuests((currentGuests) => [
        ...currentGuests,
        result.guest,
      ]);

      setSuccess("Invité ajouté avec succès !");
      form.reset();
    } catch {
      setError(
        "Impossible d’ajouter l’invité pour le moment."
      );
    } finally {
      setLoading(false);
    }
  }

  const acceptedCount = guests.filter(
    (guest) => guest.status === "accepted"
  ).length;

  const declinedCount = guests.filter(
    (guest) => guest.status === "declined"
  ).length;

  const maybeCount = guests.filter(
    (guest) => guest.status === "maybe"
  ).length;

  const pendingCount = guests.filter(
    (guest) => guest.status === "pending"
  ).length;

  const totalExpectedPeople = guests
    .filter((guest) => guest.status === "accepted")
    .reduce(
      (total, guest) => total + 1 + guest.companionCount,
      0
    );

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/dashboard/events/${id}`}
          className="text-sm font-medium text-pink-600 hover:text-pink-700"
        >
          ← Retour à l’événement
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
            Invity
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Gestion des invités
          </h1>

          <p className="mt-2 text-gray-500">
            Ajoutez vos invités et suivez leurs réponses.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Invités
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {guests.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Présents
            </p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {acceptedCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Absents
            </p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {declinedCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              En attente
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-700">
              {pendingCount + maybeCount}
            </p>
          </div>

          <div className="rounded-2xl bg-pink-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-pink-700">
              Personnes attendues
            </p>
            <p className="mt-2 text-3xl font-bold text-pink-600">
              {totalExpectedPeople}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Ajouter un invité
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="text-sm font-semibold text-gray-700"
                >
                  Prénom
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="text-sm font-semibold text-gray-700"
                >
                  Nom
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Adresse e-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
              />

              <p className="mt-2 text-xs text-gray-400">
                Facultatif
              </p>
            </div>

            <div>
              <label
                htmlFor="maxCompanions"
                className="text-sm font-semibold text-gray-700"
              >
                Nombre maximum d’accompagnants
              </label>

              <input
                id="maxCompanions"
                name="maxCompanions"
                type="number"
                min="0"
                max="20"
                defaultValue="0"
                required
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
              />

              <p className="mt-2 text-xs text-gray-400">
                Mettez 0 si cet invité ne peut pas venir accompagné.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
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
              {guests.length} invité
              {guests.length > 1 ? "s" : ""}
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

                    <p className="mt-2 text-sm text-gray-500">
                      Accompagnants autorisés :{" "}
                      {guest.maxCompanions}
                    </p>

                    {guest.status === "accepted" && (
                      <p className="mt-1 text-sm font-medium text-green-700">
                        {guest.companionCount === 0
                          ? "Vient seul(e)"
                          : guest.companionCount === 1
                            ? "Vient avec 1 accompagnant"
                            : `Vient avec ${guest.companionCount} accompagnants`}
                      </p>
                    )}

                    {guest.status === "accepted" && (
                      <p className="mt-1 text-xs text-gray-500">
                        Total pour cette invitation :{" "}
                        {1 + guest.companionCount} personne
                        {1 + guest.companionCount > 1
                          ? "s"
                          : ""}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        guest.status
                      )}`}
                    >
                      {getStatusLabel(guest.status)}
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