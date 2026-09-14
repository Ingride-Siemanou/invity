"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function GuestsPage() {
  const params = useParams();
  const id = params.id as string;

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
      </div>
    </main>
  );
}