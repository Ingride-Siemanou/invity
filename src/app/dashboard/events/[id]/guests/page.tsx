"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type GuestAnswer = {
  questionId: number;
  questionLabel: string;
  questionType: string;
  required: boolean;
  value: string;
};

type Guest = {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  status: string;
  token: string;
  maxCompanions: number;
  companionCount: number;
  childrenCount: number;
  childrenAges: string | null;
  answers: GuestAnswer[];
};

function safeNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

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
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (status === "declined") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "maybe") {
    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  return "border-gray-200 bg-gray-100 text-gray-600";
}

export default function GuestsPage() {
  const params = useParams();
  const id = params.id as string;

  const [guests, setGuests] = useState<Guest[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGuests, setLoadingGuests] = useState(true);

  const [copiedGuestId, setCopiedGuestId] =
    useState<number | null>(null);

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
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
      maxCompanions: Number(
        formData.get("maxCompanions")
      ),
    };

    try {
      const response = await fetch(
        `/api/events/${id}/guests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Une erreur est survenue."
        );
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

  async function copyInvitationLink(guest: Guest) {
    const invitationUrl = `${window.location.origin}/i/${guest.token}`;

    try {
      await navigator.clipboard.writeText(invitationUrl);

      setCopiedGuestId(guest.id);

      window.setTimeout(() => {
        setCopiedGuestId((currentId) =>
          currentId === guest.id ? null : currentId
        );
      }, 2000);
    } catch {
      setError(
        "Impossible de copier le lien automatiquement."
      );
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
      (total, guest) =>
        total +
        1 +
        safeNumber(guest.companionCount) +
        safeNumber(guest.childrenCount),
      0
    );

  const totalCompanions = guests
    .filter((guest) => guest.status === "accepted")
    .reduce(
      (total, guest) =>
        total + safeNumber(guest.companionCount),
      0
    );

  const totalChildren = guests
    .filter((guest) => guest.status === "accepted")
    .reduce(
      (total, guest) =>
        total + safeNumber(guest.childrenCount),
      0
    );

  return (
    <main className="min-h-screen bg-[#f8f8fb] text-gray-900">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard">
            <div className="text-2xl font-bold tracking-tight text-pink-600">
              Invity
            </div>

            <div className="hidden text-[10px] font-medium tracking-wide text-gray-400 sm:block">
              Créez. Invitez. Célébrez.
            </div>
          </Link>

          <Link
            href={`/dashboard/events/${id}`}
            className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-pink-200 hover:text-pink-600 sm:px-5 sm:text-sm"
          >
            ← Événement
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-gray-950 px-5 py-8 text-white shadow-xl sm:rounded-[36px] sm:px-8 sm:py-10 lg:px-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-600/20 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-pink-300">
                Gestion des invités
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Vos invités 👥
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-gray-300 sm:text-base sm:leading-7">
                Ajoutez vos invités, gérez leurs accompagnants
                et partagez facilement leur lien personnel
                d’invitation.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
              <p className="text-xs text-gray-400">
                Personnes attendues
              </p>

              <p className="mt-1 text-3xl font-bold text-pink-300">
                {totalExpectedPeople}
              </p>
            </div>
          </div>
        </section>

        {/* Statistiques */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <StatCard
            icon="👥"
            label="Invités"
            value={guests.length}
          />

          <StatCard
            icon="✓"
            label="Présents"
            value={acceptedCount}
            variant="green"
          />

          <StatCard
            icon="✕"
            label="Absents"
            value={declinedCount}
            variant="red"
          />

          <StatCard
            icon="⏳"
            label="En attente"
            value={pendingCount + maybeCount}
            variant="yellow"
          />

          <StatCard
            icon="🎟️"
            label="Personnes attendues"
            value={totalExpectedPeople}
            variant="pink"
            wideOnMobile
          />
        </section>

        {acceptedCount > 0 && (
          <section className="mt-4 grid gap-3 sm:grid-cols-3">
            <SmallSummary
              icon="🙋"
              value={acceptedCount}
              label="invités présents"
            />

            <SmallSummary
              icon="🤝"
              value={totalCompanions}
              label="accompagnants"
            />

            <SmallSummary
              icon="👶"
              value={totalChildren}
              label="enfants"
            />
          </section>
        )}

        {/* Contenu */}
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          {/* Formulaire */}
          <section className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-xl">
              ➕
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-950">
              Ajouter un invité
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Chaque invité recevra son propre lien
              d’invitation.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
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
                  placeholder="Ex. Arthur"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
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
                  placeholder="Ex. Dupont"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Adresse e-mail
                  </label>

                  <span className="text-xs text-gray-400">
                    Facultatif
                  </span>
                </div>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemple@email.com"
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                />
              </div>

              <div>
                <label
                  htmlFor="maxCompanions"
                  className="text-sm font-semibold text-gray-700"
                >
                  Accompagnants autorisés
                </label>

                <input
                  id="maxCompanions"
                  name="maxCompanions"
                  type="number"
                  min="0"
                  max="20"
                  defaultValue="0"
                  required
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                />

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  Indiquez 0 si cet invité ne peut pas venir
                  accompagné.
                </p>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-pink-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Ajout en cours..."
                  : "+ Ajouter l’invité"}
              </button>
            </form>
          </section>

          {/* Liste */}
          <section className="min-w-0 rounded-[28px] border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-950">
                  Liste des invités
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Consultez les réponses et partagez le lien
                  personnel de chaque invitation.
                </p>
              </div>

              <span className="w-fit rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                {guests.length} invité
                {guests.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loadingGuests ? (
              <div className="py-14 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-pink-600" />

                <p className="mt-4 text-sm text-gray-500">
                  Chargement des invités...
                </p>
              </div>
            ) : guests.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
                  👥
                </div>

                <h3 className="mt-4 font-bold text-gray-900">
                  Aucun invité pour le moment
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Utilisez le formulaire pour ajouter votre
                  premier invité.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {guests.map((guest) => {
                  const companionCount = safeNumber(
                    guest.companionCount
                  );

                  const childrenCount = safeNumber(
                    guest.childrenCount
                  );

                  const maxCompanions = safeNumber(
                    guest.maxCompanions
                  );

                  const totalForInvitation =
                    1 + companionCount + childrenCount;

                  const invitationPath = `/i/${guest.token}`;

                  return (
                    <article
                      key={guest.id}
                      className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:border-gray-200 hover:shadow-sm"
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 gap-3 sm:gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 font-bold text-gray-700">
                              {guest.firstName
                                .charAt(0)
                                .toUpperCase()}
                              {guest.lastName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="break-words font-bold text-gray-950">
                                  {guest.firstName}{" "}
                                  {guest.lastName}
                                </h3>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getStatusClass(
                                    guest.status
                                  )}`}
                                >
                                  {getStatusLabel(
                                    guest.status
                                  )}
                                </span>
                              </div>

                              {guest.email && (
                                <p className="mt-1 break-all text-sm text-gray-500">
                                  {guest.email}
                                </p>
                              )}

                              <p className="mt-3 text-xs text-gray-400">
                                Jusqu’à {maxCompanions}{" "}
                                accompagnant
                                {maxCompanions !== 1
                                  ? "s"
                                  : ""}{" "}
                                autorisé
                                {maxCompanions !== 1
                                  ? "s"
                                  : ""}
                              </p>
                            </div>
                          </div>

                          <Link
                            href={invitationPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full shrink-0 items-center justify-center rounded-full border border-pink-200 bg-pink-50 px-4 py-2.5 text-sm font-semibold text-pink-700 transition hover:bg-pink-100 sm:w-auto"
                          >
                            Ouvrir l’invitation ↗
                          </Link>
                        </div>

                        {/* Lien individuel */}
                        <div className="mt-5 rounded-2xl border border-pink-100 bg-pink-50/50 p-3 sm:p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-pink-700">
                            🔗 Lien individuel
                          </p>

                          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                              <p className="truncate text-sm text-gray-600">
                                {typeof window !== "undefined"
                                  ? `${window.location.origin}${invitationPath}`
                                  : invitationPath}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                copyInvitationLink(guest)
                              }
                              className={`inline-flex shrink-0 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                copiedGuestId === guest.id
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-950 text-white hover:bg-gray-800"
                              }`}
                            >
                              {copiedGuestId === guest.id
                                ? "✓ Lien copié"
                                : "📋 Copier le lien"}
                            </button>
                          </div>

                          <p className="mt-2 text-xs leading-5 text-gray-500">
                            Ce lien est personnel. Envoyez-le
                            uniquement à cet invité.
                          </p>
                        </div>

                        {guest.status === "accepted" && (
                          <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <GuestInfo
                              icon="🙋"
                              label="Invité"
                              value="1"
                            />

                            <GuestInfo
                              icon="🤝"
                              label="Accompagnants"
                              value={String(companionCount)}
                            />

                            <GuestInfo
                              icon="👶"
                              label="Enfants"
                              value={String(childrenCount)}
                            />
                          </div>
                        )}

                        {guest.status === "accepted" &&
                          childrenCount > 0 && (
                            <div className="mt-3 rounded-2xl border border-purple-100 bg-purple-50/70 px-4 py-3">
                              <p className="text-sm font-semibold text-purple-700">
                                👶{" "}
                                {childrenCount === 1
                                  ? "1 enfant"
                                  : `${childrenCount} enfants`}
                              </p>

                              {guest.childrenAges && (
                                <p className="mt-1 break-words text-sm text-gray-600">
                                  {childrenCount === 1
                                    ? "Âge"
                                    : "Âges"}{" "}
                                  : {guest.childrenAges}
                                </p>
                              )}
                            </div>
                          )}

                        {guest.status === "accepted" && (
                          <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-green-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-medium text-green-700">
                              {companionCount === 0
                                ? "Vient seul(e)"
                                : companionCount === 1
                                  ? "Vient avec 1 accompagnant"
                                  : `Vient avec ${companionCount} accompagnants`}
                            </p>

                            <p className="text-xs font-semibold text-gray-600">
                              Total : {totalForInvitation}{" "}
                              personne
                              {totalForInvitation !== 1
                                ? "s"
                                : ""}
                            </p>
                          </div>
                        )}

                        {guest.answers &&
                          guest.answers.length > 0 && (
                            <div className="mt-5 border-t border-gray-100 pt-5">
                              <p className="text-sm font-bold text-gray-900">
                                Réponses personnalisées
                              </p>

                              <div className="mt-3 grid gap-3 md:grid-cols-2">
                                {guest.answers.map(
                                  (answer) => (
                                    <div
                                      key={
                                        answer.questionId
                                      }
                                      className="min-w-0 rounded-2xl bg-gray-50 px-4 py-3"
                                    >
                                      <p className="break-words text-xs font-medium leading-5 text-gray-500">
                                        {
                                          answer.questionLabel
                                        }
                                      </p>

                                      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                                        {answer.value ||
                                          "Pas de réponse"}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="mt-10 border-t border-gray-200 py-7">
          <Link
            href={`/dashboard/events/${id}`}
            className="text-sm font-semibold text-pink-600 transition hover:text-pink-700"
          >
            ← Retour à l’événement
          </Link>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  variant = "default",
  wideOnMobile = false,
}: {
  icon: string;
  label: string;
  value: number;
  variant?:
    | "default"
    | "green"
    | "red"
    | "yellow"
    | "pink";
  wideOnMobile?: boolean;
}) {
  const styles = {
    default: {
      card: "bg-white",
      icon: "bg-gray-100 text-gray-700",
      value: "text-gray-950",
    },
    green: {
      card: "bg-green-50/70",
      icon: "bg-green-100 text-green-700",
      value: "text-green-700",
    },
    red: {
      card: "bg-red-50/70",
      icon: "bg-red-100 text-red-700",
      value: "text-red-700",
    },
    yellow: {
      card: "bg-yellow-50/70",
      icon: "bg-yellow-100 text-yellow-700",
      value: "text-yellow-700",
    },
    pink: {
      card: "bg-pink-50/80",
      icon: "bg-pink-100 text-pink-700",
      value: "text-pink-700",
    },
  };

  const style = styles[variant];

  return (
    <div
      className={`min-w-0 rounded-2xl border border-white/70 p-4 shadow-sm sm:p-5 ${
        style.card
      } ${wideOnMobile ? "col-span-2 lg:col-span-1" : ""}`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${style.icon}`}
      >
        {icon}
      </div>

      <p className="mt-4 break-words text-xs font-medium leading-5 text-gray-500 sm:text-sm">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-bold sm:text-3xl ${style.value}`}
      >
        {value}
      </p>
    </div>
  );
}

function SmallSummary({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-lg font-bold text-gray-950">
          {value}
        </p>

        <p className="break-words text-xs text-gray-500">
          {label}
        </p>
      </div>
    </div>
  );
}

function GuestInfo({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3">
      <div className="flex items-center gap-2">
        <span>{icon}</span>

        <span className="text-xs text-gray-500">
          {label}
        </span>
      </div>

      <p className="mt-2 text-lg font-bold text-gray-950">
        {value}
      </p>
    </div>
  );
}