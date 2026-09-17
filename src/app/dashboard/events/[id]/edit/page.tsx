"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type EventData = {
  id: number;
  title: string;
  eventType: string;
  eventDate: string;
  eventTime: string | null;
  location: string | null;
  description: string | null;
  childrenPolicy: string;
  minimumChildAge: number | null;
  dressCode: string | null;
  importantInfo: string | null;
};

const EVENT_TYPES = [
  {
    value: "wedding",
    label: "Mariage",
    description: "Cérémonie et réception de mariage",
  },
  {
    value: "birthday",
    label: "Anniversaire",
    description: "Fête d'anniversaire",
  },
  {
    value: "baptism",
    label: "Baptême",
    description: "Baptême et réception",
  },
  {
    value: "ceremony",
    label: "Cérémonie",
    description: "Cérémonie privée ou familiale",
  },
  {
    value: "party",
    label: "Fête",
    description: "Soirée ou célébration",
  },
  {
    value: "professional",
    label: "Événement professionnel",
    description: "Événement d'entreprise ou professionnel",
  },
  {
    value: "other",
    label: "Autre",
    description: "Un autre type d'événement",
  },
];

const CHILDREN_POLICIES = [
  {
    value: "allowed",
    label: "Enfants autorisés",
    description:
      "Les invités pourront indiquer s'ils viennent avec des enfants.",
  },
  {
    value: "not_allowed",
    label: "Sans enfants",
    description:
      "L'invitation indiquera que l'événement est réservé aux adultes.",
  },
  {
    value: "minimum_age",
    label: "À partir d'un âge minimum",
    description:
      "Les enfants sont autorisés uniquement à partir de l'âge indiqué.",
  },
];

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("other");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [childrenPolicy, setChildrenPolicy] =
    useState("allowed");

  const [minimumChildAge, setMinimumChildAge] =
    useState("");

  const [dressCode, setDressCode] = useState("");
  const [importantInfo, setImportantInfo] = useState("");

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/events/${id}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Impossible de charger cet événement."
          );
        }

        const event = data.event as EventData;

        setTitle(event.title || "");
        setEventType(event.eventType || "other");
        setEventDate(event.eventDate || "");
        setEventTime(event.eventTime || "");
        setLocation(event.location || "");
        setDescription(event.description || "");

        setChildrenPolicy(
          event.childrenPolicy || "allowed"
        );

        setMinimumChildAge(
          event.minimumChildAge !== null &&
            event.minimumChildAge !== undefined
            ? String(event.minimumChildAge)
            : ""
        );

        setDressCode(event.dressCode || "");
        setImportantInfo(event.importantInfo || "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadEvent();
    }
  }, [id]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Le nom de l'événement est obligatoire.");
      return;
    }

    if (!eventDate) {
      setError("La date de l'événement est obligatoire.");
      return;
    }

    if (
      childrenPolicy === "minimum_age" &&
      minimumChildAge === ""
    ) {
      setError(
        "Veuillez indiquer l'âge minimum des enfants."
      );
      return;
    }

    if (childrenPolicy === "minimum_age") {
      const age = Number(minimumChildAge);

      if (
        !Number.isInteger(age) ||
        age < 0 ||
        age > 18
      ) {
        setError(
          "L'âge minimum doit être compris entre 0 et 18 ans."
        );
        return;
      }
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          eventType,
          eventDate,
          eventTime,
          location,
          description,
          childrenPolicy,
          minimumChildAge:
            childrenPolicy === "minimum_age"
              ? Number(minimumChildAge)
              : null,
          dressCode,
          importantInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Impossible de modifier l'événement."
        );
      }

      setSuccess("Les modifications ont été enregistrées.");

      setTimeout(() => {
        router.push(`/dashboard/events/${id}`);
        router.refresh();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
          <div className="rounded-3xl border border-gray-100 bg-white px-8 py-7 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-pink-100 border-t-pink-600" />

            <p className="mt-4 text-sm font-medium text-gray-600">
              Chargement de l&apos;événement...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !title) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>

            <Link
              href="/dashboard"
              className="mt-6 inline-flex rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href={`/dashboard/events/${id}`}
                className="text-sm font-semibold text-pink-600 transition hover:text-pink-700"
              >
                Retour à l&apos;événement
              </Link>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
                Invity
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Modifier l&apos;événement
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                Modifiez les informations générales de votre
                événement. Les invitations et les réponses de vos
                invités seront conservées.
              </p>
            </div>

            <Link
              href={`/dashboard/events/${id}`}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              Annuler
            </Link>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
              <p className="text-sm font-medium text-green-700">
                {success}
              </p>
            </div>
          )}

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-600">
                Type d&apos;événement
              </p>

              <h2 className="mt-2 text-xl font-bold text-gray-950">
                Quel événement organisez-vous ?
              </h2>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">
              {EVENT_TYPES.map((type) => {
                const selected =
                  eventType === type.value;

                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setEventType(type.value)
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-pink-500 bg-pink-50 ring-2 ring-pink-100"
                        : "border-gray-200 bg-white hover:border-pink-200 hover:bg-pink-50/40"
                    }`}
                  >
                    <p
                      className={`font-semibold ${
                        selected
                          ? "text-pink-700"
                          : "text-gray-900"
                      }`}
                    >
                      {type.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-600">
                Informations principales
              </p>

              <h2 className="mt-2 text-xl font-bold text-gray-950">
                Les détails essentiels
              </h2>
            </div>

            <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Nom de l&apos;événement
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  required
                  placeholder="Ex. Mariage de Léa et Thomas"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                />
              </div>

              <div>
                <label
                  htmlFor="eventDate"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Date
                </label>

                <input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(event) =>
                    setEventDate(event.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                />
              </div>

              <div>
                <label
                  htmlFor="eventTime"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Heure
                </label>

                <input
                  id="eventTime"
                  type="time"
                  value={eventTime}
                  onChange={(event) =>
                    setEventTime(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Lieu
                </label>

                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="Ex. Domaine des Roses, Paris"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={4}
                  placeholder="Quelques mots pour présenter votre événement..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                Enfants
              </p>

              <h2 className="mt-2 text-xl font-bold text-gray-950">
                Règle concernant les enfants
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Cette règle sera utilisée automatiquement dans
                l&apos;invitation et le formulaire de réponse.
              </p>
            </div>

            <div className="space-y-3 p-5 sm:p-7">
              {CHILDREN_POLICIES.map((policy) => {
                const selected =
                  childrenPolicy === policy.value;

                return (
                  <button
                    key={policy.value}
                    type="button"
                    onClick={() => {
                      setChildrenPolicy(policy.value);

                      if (
                        policy.value !== "minimum_age"
                      ) {
                        setMinimumChildAge("");
                      }
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                    }`}
                  >
                    <p
                      className={`font-semibold ${
                        selected
                          ? "text-blue-700"
                          : "text-gray-900"
                      }`}
                    >
                      {policy.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {policy.description}
                    </p>
                  </button>
                );
              })}

              {childrenPolicy === "minimum_age" && (
                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                  <label
                    htmlFor="minimumChildAge"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Âge minimum
                  </label>

                  <input
                    id="minimumChildAge"
                    type="number"
                    min="0"
                    max="18"
                    step="1"
                    value={minimumChildAge}
                    onChange={(event) =>
                      setMinimumChildAge(
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:max-w-xs"
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Indiquez un âge compris entre 0 et 18 ans.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                Informations complémentaires
              </p>

              <h2 className="mt-2 text-xl font-bold text-gray-950">
                Précisions pour vos invités
              </h2>
            </div>

            <div className="grid gap-5 p-5 sm:p-7">
              <div>
                <label
                  htmlFor="dressCode"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Dress code
                </label>

                <input
                  id="dressCode"
                  type="text"
                  value={dressCode}
                  onChange={(event) =>
                    setDressCode(event.target.value)
                  }
                  placeholder="Ex. Tenue de soirée, couleurs pastel..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                />
              </div>

              <div>
                <label
                  htmlFor="importantInfo"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Informations importantes
                </label>

                <textarea
                  id="importantInfo"
                  value={importantInfo}
                  onChange={(event) =>
                    setImportantInfo(event.target.value)
                  }
                  rows={4}
                  placeholder="Ex. Merci d'arriver 30 minutes avant la cérémonie..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                />
              </div>
            </div>
          </section>

          <div className="sticky bottom-4 z-10 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex sm:items-center sm:justify-between">
            <p className="mb-3 text-xs leading-5 text-gray-500 sm:mb-0 sm:max-w-md">
              Les invités, leurs réponses, les questions et la
              personnalisation de l&apos;invitation ne seront pas
              supprimés.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/dashboard/events/${id}`}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Annuler
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-pink-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Enregistrement..."
                  : "Enregistrer les modifications"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}