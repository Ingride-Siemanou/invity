"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const EVENT_TYPES = [
  {
    value: "wedding",
    label: "Mariage",
    icon: "💍",
    description: "Mariage, union ou célébration",
  },
  {
    value: "birthday",
    label: "Anniversaire",
    icon: "🎂",
    description: "Anniversaire ou fête d’anniversaire",
  },
  {
    value: "baptism",
    label: "Baptême",
    icon: "🕊️",
    description: "Baptême ou célébration familiale",
  },
  {
    value: "ceremony",
    label: "Cérémonie",
    icon: "✨",
    description: "Cérémonie ou célébration particulière",
  },
  {
    value: "party",
    label: "Fête",
    icon: "🎉",
    description: "Soirée, réception ou fête privée",
  },
  {
    value: "professional",
    label: "Événement professionnel",
    icon: "💼",
    description: "Entreprise, conférence ou réception",
  },
  {
    value: "other",
    label: "Autre",
    icon: "✦",
    description: "Un autre type d’événement",
  },
];

export default function NewEventPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [childrenPolicy, setChildrenPolicy] =
    useState("allowed");
  const [eventType, setEventType] = useState("wedding");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form = event.currentTarget;

    setError("");
    setLoading(true);

    const formData = new FormData(form);

    const data = {
      title: formData.get("title"),
      eventType,
      eventDate: formData.get("date"),
      eventTime: formData.get("time"),
      location: formData.get("location"),
      description: formData.get("description"),
      childrenPolicy,
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
        setError(
          result.error || "Une erreur est survenue."
        );
        return;
      }

      form.reset();

      router.push(`/dashboard/events/${result.event.id}`);
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
    <main className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-pink-600"
          >
            <span aria-hidden="true">←</span>
            Retour au tableau de bord
          </Link>
        </div>
      </div>

      <section className="bg-gray-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-pink-300">
              Invity
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Créer un événement
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
              Configurez les informations essentielles de votre
              événement. Vous pourrez ensuite ajouter vos invités et
              personnaliser les questions de l’invitation.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 sm:space-y-8"
        >
          <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              number="1"
              title="Type d’événement"
              description="Choisissez la catégorie qui correspond le mieux à votre événement."
            />

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {EVENT_TYPES.map((type) => {
                  const selected = eventType === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setEventType(type.value)}
                      className={`relative flex min-h-28 items-start gap-4 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-pink-500 bg-pink-50 ring-2 ring-pink-100"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                        {type.icon}
                      </span>

                      <span className="min-w-0">
                        <span
                          className={`block text-sm font-bold ${
                            selected
                              ? "text-pink-700"
                              : "text-gray-900"
                          }`}
                        >
                          {type.label}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-gray-500">
                          {type.description}
                        </span>
                      </span>

                      {selected && (
                        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-pink-600 text-xs font-bold text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              number="2"
              title="Informations principales"
              description="Les informations qui permettront à vos invités d’identifier l’événement."
            />

            <div className="space-y-6 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Nom de l’événement
                  <span className="ml-1 text-pink-600">*</span>
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Ex. Mariage de Marie et Paul"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Date
                    <span className="ml-1 text-pink-600">*</span>
                  </label>

                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Heure
                  </label>

                  <input
                    id="time"
                    name="time"
                    type="time"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Facultatif
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Lieu
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  maxLength={300}
                  placeholder="Ex. Château de..."
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Facultatif
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  maxLength={2000}
                  placeholder="Ajoutez quelques détails sur votre événement..."
                  className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Facultatif
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              number="3"
              title="Enfants"
              description="Définissez les règles concernant la présence des enfants."
            />

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="childrenPolicy"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Règle concernant les enfants
                </label>

                <select
                  id="childrenPolicy"
                  name="childrenPolicy"
                  value={childrenPolicy}
                  onChange={(event) =>
                    setChildrenPolicy(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
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

              {childrenPolicy === "allowed" && (
                <InfoBox>
                  Vos invités pourront indiquer s’ils viennent avec
                  un ou plusieurs enfants, leur nombre et leur âge.
                </InfoBox>
              )}

              {childrenPolicy === "not_allowed" && (
                <InfoBox>
                  Aucune question concernant les enfants ne sera
                  affichée sur l’invitation.
                </InfoBox>
              )}

              {childrenPolicy === "minimum_age" && (
                <>
                  <div>
                    <label
                      htmlFor="minimumChildAge"
                      className="block text-sm font-semibold text-gray-800"
                    >
                      Âge minimum
                      <span className="ml-1 text-pink-600">*</span>
                    </label>

                    <input
                      id="minimumChildAge"
                      name="minimumChildAge"
                      type="number"
                      min="0"
                      max="18"
                      required
                      placeholder="Ex. 12"
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-50 sm:max-w-xs"
                    />
                  </div>

                  <InfoBox>
                    L’âge minimum sera indiqué à vos invités
                    lorsqu’ils répondront à leur invitation.
                  </InfoBox>
                </>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <SectionHeader
              number="4"
              title="Informations complémentaires"
              description="Ajoutez les dernières informations utiles pour vos invités."
            />

            <div className="space-y-6 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="dressCode"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Dress code
                </label>

                <input
                  id="dressCode"
                  name="dressCode"
                  type="text"
                  maxLength={300}
                  placeholder="Ex. Tenue élégante, cocktail, blanc et beige..."
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Facultatif
                </p>
              </div>

              <div>
                <label
                  htmlFor="importantInfo"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Informations importantes
                </label>

                <textarea
                  id="importantInfo"
                  name="importantInfo"
                  rows={4}
                  maxLength={2000}
                  placeholder="Ex. Merci d’arriver avant 17h30, cérémonie sans téléphone..."
                  className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Facultatif
                </p>
              </div>
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-pink-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading
                ? "Création en cours..."
                : "Créer l’événement"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-sm font-bold text-white">
          {number}
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-5 text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3 text-sm leading-6 text-gray-700">
      <span className="mr-2" aria-hidden="true">
        ℹ️
      </span>
      {children}
    </div>
  );
}