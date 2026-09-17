"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const EVENT_TYPES = [
  {
    value: "wedding",
    label: "Mariage",
    description: "Mariage, union ou célébration",
    accent: "pink",
  },
  {
    value: "birthday",
    label: "Anniversaire",
    description: "Anniversaire ou fête d’anniversaire",
    accent: "purple",
  },
  {
    value: "baptism",
    label: "Baptême",
    description: "Baptême ou célébration familiale",
    accent: "blue",
  },
  {
    value: "ceremony",
    label: "Cérémonie",
    description: "Cérémonie ou célébration particulière",
    accent: "amber",
  },
  {
    value: "party",
    label: "Fête",
    description: "Soirée, réception ou fête privée",
    accent: "rose",
  },
  {
    value: "professional",
    label: "Événement professionnel",
    description: "Entreprise, conférence ou réception",
    accent: "indigo",
  },
  {
    value: "other",
    label: "Autre",
    description: "Un autre type d’événement",
    accent: "emerald",
  },
];

const EVENT_TYPE_STYLES = {
  pink: {
    selected:
      "border-pink-400 bg-pink-50 ring-2 ring-pink-100",
    line: "bg-pink-500",
    text: "text-pink-700",
  },
  purple: {
    selected:
      "border-purple-400 bg-purple-50 ring-2 ring-purple-100",
    line: "bg-purple-500",
    text: "text-purple-700",
  },
  blue: {
    selected:
      "border-blue-400 bg-blue-50 ring-2 ring-blue-100",
    line: "bg-blue-500",
    text: "text-blue-700",
  },
  amber: {
    selected:
      "border-amber-400 bg-amber-50 ring-2 ring-amber-100",
    line: "bg-amber-500",
    text: "text-amber-700",
  },
  rose: {
    selected:
      "border-rose-400 bg-rose-50 ring-2 ring-rose-100",
    line: "bg-rose-500",
    text: "text-rose-700",
  },
  indigo: {
    selected:
      "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100",
    line: "bg-indigo-500",
    text: "text-indigo-700",
  },
  emerald: {
    selected:
      "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100",
    line: "bg-emerald-500",
    text: "text-emerald-700",
  },
};

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
    <main className="min-h-screen bg-[#faf9fc] text-gray-900">
      {/* Navigation */}
      <header className="border-b border-pink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="text-2xl font-bold tracking-tight text-pink-600"
          >
            Invity
          </Link>

          <Link
            href="/dashboard"
            className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-pink-200 hover:text-pink-600"
          >
            Tableau de bord
          </Link>
        </div>
      </header>

      {/* Introduction */}
      <section className="relative overflow-hidden border-b border-pink-100 bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl" />

        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-pink-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-pink-600 shadow-sm">
              Nouvel événement
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
              Créer un événement
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
              Configurez les informations essentielles de votre
              événement. Vous pourrez ensuite ajouter vos invités et
              personnaliser les questions de l’invitation.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-pink-100 bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-700">
                Invitation personnalisée
              </span>

              <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                Gestion des invités
              </span>

              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                Réponses simplifiées
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 sm:space-y-8"
        >
          {/* Type d'événement */}
          <section className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
            <SectionHeader
              number="1"
              title="Type d’événement"
              description="Choisissez la catégorie qui correspond le mieux à votre événement."
              accent="pink"
            />

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {EVENT_TYPES.map((type) => {
                  const selected = eventType === type.value;

                  const style =
                    EVENT_TYPE_STYLES[
                      type.accent as keyof typeof EVENT_TYPE_STYLES
                    ];

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setEventType(type.value)}
                      aria-pressed={selected}
                      className={`relative min-h-28 overflow-hidden rounded-2xl border p-5 text-left transition ${
                        selected
                          ? style.selected
                          : "border-gray-200 bg-white hover:border-pink-200 hover:bg-pink-50/30"
                      }`}
                    >
                      <span
                        className={`mb-4 block h-1 w-10 rounded-full ${style.line}`}
                      />

                      <span
                        className={`block text-sm font-bold ${
                          selected
                            ? style.text
                            : "text-gray-900"
                        }`}
                      >
                        {type.label}
                      </span>

                      <span className="mt-1.5 block max-w-[90%] text-xs leading-5 text-gray-500">
                        {type.description}
                      </span>

                      {selected && (
                        <span
                          className={`absolute right-4 top-4 h-2.5 w-2.5 rounded-full ${style.line}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Informations principales */}
          <section className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">
            <SectionHeader
              number="2"
              title="Informations principales"
              description="Les informations qui permettront à vos invités d’identifier l’événement."
              accent="purple"
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
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
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
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
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
                  className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Facultatif
                </p>
              </div>
            </div>
          </section>

          {/* Enfants */}
          <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
            <SectionHeader
              number="3"
              title="Enfants"
              description="Définissez les règles concernant la présence des enfants."
              accent="blue"
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
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
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
                <InfoBox accent="blue">
                  Vos invités pourront indiquer s’ils viennent avec
                  un ou plusieurs enfants, leur nombre et leur âge.
                </InfoBox>
              )}

              {childrenPolicy === "not_allowed" && (
                <InfoBox accent="rose">
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
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 sm:max-w-xs"
                    />
                  </div>

                  <InfoBox accent="purple">
                    L’âge minimum sera indiqué à vos invités
                    lorsqu’ils répondront à leur invitation.
                  </InfoBox>
                </>
              )}
            </div>
          </section>

          {/* Informations complémentaires */}
          <section className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm">
            <SectionHeader
              number="4"
              title="Informations complémentaires"
              description="Ajoutez les dernières informations utiles pour vos invités."
              accent="amber"
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
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-50"
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
                  className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-50"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Facultatif
                </p>
              </div>
            </div>
          </section>

          {/* Erreur */}
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 rounded-3xl border border-pink-100 bg-gradient-to-r from-white via-pink-50/40 to-purple-50/50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-pink-200 hover:text-pink-600 sm:w-auto"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
  accent,
}: {
  number: string;
  title: string;
  description: string;
  accent: "pink" | "purple" | "blue" | "amber";
}) {
  const styles = {
    pink: {
      box: "bg-pink-100 text-pink-700",
      background: "from-pink-50 to-white",
    },
    purple: {
      box: "bg-purple-100 text-purple-700",
      background: "from-purple-50 to-white",
    },
    blue: {
      box: "bg-blue-100 text-blue-700",
      background: "from-blue-50 to-white",
    },
    amber: {
      box: "bg-amber-100 text-amber-700",
      background: "from-amber-50 to-white",
    },
  };

  const style = styles[accent];

  return (
    <div
      className={`border-b border-gray-100 bg-gradient-to-r ${style.background} px-5 py-5 sm:px-6`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${style.box}`}
        >
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
  accent = "pink",
}: {
  children: React.ReactNode;
  accent?: "pink" | "blue" | "purple" | "rose";
}) {
  const styles = {
    pink: "border-pink-300 bg-pink-50",
    blue: "border-blue-300 bg-blue-50",
    purple: "border-purple-300 bg-purple-50",
    rose: "border-rose-300 bg-rose-50",
  };

  return (
    <div
      className={`border-l-4 px-4 py-3 text-sm leading-6 text-gray-700 ${styles[accent]}`}
    >
      {children}
    </div>
  );
}