"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [childrenPolicy, setChildrenPolicy] = useState("allowed");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    setError("");
    setLoading(true);

    const formData = new FormData(form);

    const data = {
      title: formData.get("title"),
      eventDate: formData.get("date"),
      eventTime: formData.get("time"),
      location: formData.get("location"),
      description: formData.get("description"),
      childrenPolicy: formData.get("childrenPolicy"),
      minimumChildAge:
        childrenPolicy === "minimum_age"
          ? Number(formData.get("minimumChildAge"))
          : null,
      dressCode: formData.get("dressCode"),
      importantInfo: formData.get("importantInfo"),
    };

    try {
      const response = await fetch("/api/events", {
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

      form.reset();

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(
        "Impossible de créer l’événement pour le moment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-pink-600 hover:text-pink-700"
          >
            ← Retour au tableau de bord
          </Link>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Créer un événement
          </h1>

          <p className="mt-2 text-gray-600">
            Préparez votre invitation et les informations
            importantes pour vos invités.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nom de l’événement
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Mariage de Marie et Paul"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Date
                </label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div>
                <label
                  htmlFor="time"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Heure
                </label>

                <input
                  id="time"
                  name="time"
                  type="time"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Lieu
              </label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="Château de..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Ajoutez quelques détails sur votre événement..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-bold text-gray-900">
                Enfants
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Indiquez si les enfants sont invités à
                l’événement.
              </p>

              <div className="mt-4">
                <select
                  id="childrenPolicy"
                  name="childrenPolicy"
                  value={childrenPolicy}
                  onChange={(event) =>
                    setChildrenPolicy(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                >
                  <option value="allowed">
                    Enfants autorisés
                  </option>

                  <option value="not_allowed">
                    Pas d’enfants
                  </option>

                  <option value="minimum_age">
                    Enfants autorisés à partir d’un certain âge
                  </option>
                </select>
              </div>

              {childrenPolicy === "minimum_age" && (
                <div className="mt-4">
                  <label
                    htmlFor="minimumChildAge"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Âge minimum
                  </label>

                  <input
                    id="minimumChildAge"
                    name="minimumChildAge"
                    type="number"
                    min="0"
                    max="18"
                    required
                    placeholder="12"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <label
                htmlFor="dressCode"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Dress code
              </label>

              <input
                id="dressCode"
                name="dressCode"
                type="text"
                placeholder="Ex. : Tenue élégante, cocktail, blanc et beige..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />

              <p className="mt-2 text-xs text-gray-400">
                Facultatif
              </p>
            </div>

            <div>
              <label
                htmlFor="importantInfo"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Informations importantes
              </label>

              <textarea
                id="importantInfo"
                name="importantInfo"
                rows={4}
                placeholder="Ex. : Merci d’arriver avant 17h30, cérémonie sans téléphone..."
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-pink-600 py-3.5 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Création..."
                : "Créer l’événement"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}