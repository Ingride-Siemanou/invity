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

type EditGuestForm = {
  firstName: string;
  lastName: string;
  email: string;
  maxCompanions: number;
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

  const [sendingGuestId, setSendingGuestId] =
    useState<number | null>(null);

  const [sentGuestId, setSentGuestId] =
    useState<number | null>(null);

  const [editingGuestId, setEditingGuestId] =
    useState<number | null>(null);

  const [savingGuestId, setSavingGuestId] =
    useState<number | null>(null);

  const [deletingGuestId, setDeletingGuestId] =
    useState<number | null>(null);

  const [editForm, setEditForm] =
    useState<EditGuestForm>({
      firstName: "",
      lastName: "",
      email: "",
      maxCompanions: 0,
    });

  useEffect(() => {
    async function loadGuests() {
      try {
        const response = await fetch(
          `/api/events/${id}/guests`
        );

        const result = await response.json();

        if (!response.ok) {
          setError(
            result.error ||
              "Impossible de charger les invités."
          );
          return;
        }

        setGuests(result.guests);
      } catch {
        setError(
          "Impossible de charger les invités."
        );
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
          result.error ||
            "Une erreur est survenue."
        );
        return;
      }

      setGuests((currentGuests) => [
        ...currentGuests,
        result.guest,
      ]);

      setSuccess(
        "Invité ajouté avec succès."
      );

      form.reset();
    } catch {
      setError(
        "Impossible d’ajouter l’invité pour le moment."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyInvitationLink(
    guest: Guest
  ) {
    const invitationUrl =
      `${window.location.origin}/i/${guest.token}`;

    try {
      await navigator.clipboard.writeText(
        invitationUrl
      );

      setCopiedGuestId(guest.id);

      window.setTimeout(() => {
        setCopiedGuestId((currentId) =>
          currentId === guest.id
            ? null
            : currentId
        );
      }, 2000);
    } catch {
      setError(
        "Impossible de copier le lien automatiquement."
      );
    }
  }

  async function sendInvitationEmail(
    guest: Guest
  ) {
    if (!guest.email) {
      setError(
        "Cet invité ne possède pas d’adresse e-mail."
      );
      return;
    }

    setError("");
    setSuccess("");
    setSendingGuestId(guest.id);
    setSentGuestId(null);

    try {
      const response = await fetch(
        `/api/events/${id}/guests/${guest.id}/send-invitation`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Impossible d’envoyer l’invitation par e-mail."
        );
        return;
      }

      setSentGuestId(guest.id);

      setSuccess(
        `Invitation envoyée à ${guest.firstName}.`
      );

      window.setTimeout(() => {
        setSentGuestId((currentId) =>
          currentId === guest.id
            ? null
            : currentId
        );
      }, 4000);
    } catch {
      setError(
        "Impossible d’envoyer l’invitation par e-mail."
      );
    } finally {
      setSendingGuestId(null);
    }
  }

  function startEditingGuest(
    guest: Guest
  ) {
    setError("");
    setSuccess("");

    setEditingGuestId(guest.id);

    setEditForm({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email || "",
      maxCompanions: safeNumber(
        guest.maxCompanions
      ),
    });
  }

  function cancelEditingGuest() {
    setEditingGuestId(null);

    setEditForm({
      firstName: "",
      lastName: "",
      email: "",
      maxCompanions: 0,
    });
  }

  async function handleEditGuest(
    event: FormEvent<HTMLFormElement>,
    guest: Guest
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSavingGuestId(guest.id);

    try {
      const response = await fetch(
        `/api/events/${id}/guests/${guest.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Impossible de modifier cet invité."
        );
        return;
      }

      setGuests((currentGuests) =>
        currentGuests.map((currentGuest) => {
          if (
            currentGuest.id !== guest.id
          ) {
            return currentGuest;
          }

          return {
            ...currentGuest,
            ...result.guest,
            answers:
              currentGuest.answers || [],
          };
        })
      );

      setEditingGuestId(null);

      setSuccess(
        `${result.guest.firstName} ${result.guest.lastName} a été modifié avec succès.`
      );
    } catch {
      setError(
        "Impossible de modifier cet invité pour le moment."
      );
    } finally {
      setSavingGuestId(null);
    }
  }

  async function deleteGuest(
    guest: Guest
  ) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer ${guest.firstName} ${guest.lastName} ?\n\nCette action supprimera également ses réponses et ne pourra pas être annulée.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingGuestId(guest.id);

    try {
      const response = await fetch(
        `/api/events/${id}/guests/${guest.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Impossible de supprimer cet invité."
        );
        return;
      }

      setGuests((currentGuests) =>
        currentGuests.filter(
          (currentGuest) =>
            currentGuest.id !== guest.id
        )
      );

      if (editingGuestId === guest.id) {
        setEditingGuestId(null);
      }

      setSuccess(
        `${guest.firstName} ${guest.lastName} a été supprimé de la liste.`
      );
    } catch {
      setError(
        "Impossible de supprimer cet invité pour le moment."
      );
    } finally {
      setDeletingGuestId(null);
    }
  }

  const acceptedCount = guests.filter(
    (guest) =>
      guest.status === "accepted"
  ).length;

  const declinedCount = guests.filter(
    (guest) =>
      guest.status === "declined"
  ).length;

  const maybeCount = guests.filter(
    (guest) =>
      guest.status === "maybe"
  ).length;

  const pendingCount = guests.filter(
    (guest) =>
      guest.status === "pending"
  ).length;

  const totalExpectedPeople = guests
    .filter(
      (guest) =>
        guest.status === "accepted"
    )
    .reduce(
      (total, guest) =>
        total +
        1 +
        safeNumber(
          guest.companionCount
        ) +
        safeNumber(
          guest.childrenCount
        ),
      0
    );

  const totalCompanions = guests
    .filter(
      (guest) =>
        guest.status === "accepted"
    )
    .reduce(
      (total, guest) =>
        total +
        safeNumber(
          guest.companionCount
        ),
      0
    );

  const totalChildren = guests
    .filter(
      (guest) =>
        guest.status === "accepted"
    )
    .reduce(
      (total, guest) =>
        total +
        safeNumber(
          guest.childrenCount
        ),
      0
    );

  return (
    <main className="min-h-screen bg-[#faf9fc] text-gray-900">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/90 backdrop-blur-xl">
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
            className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-pink-200 hover:text-pink-600 sm:px-5 sm:text-sm"
          >
            Retour à l’événement
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <section className="relative overflow-hidden rounded-[28px] border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-purple-50 px-5 py-8 shadow-sm sm:rounded-[36px] sm:px-8 sm:py-10 lg:px-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-pink-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-pink-700">
                Gestion des invités
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                Vos invités
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
                Ajoutez vos invités, gérez
                leurs informations et envoyez
                facilement leur invitation
                personnelle.
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
              <p className="text-xs font-medium text-gray-500">
                Personnes attendues
              </p>

              <p className="mt-1 text-3xl font-bold text-purple-700">
                {totalExpectedPeople}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <StatCard
            label="Invités"
            value={guests.length}
          />

          <StatCard
            label="Présents"
            value={acceptedCount}
            variant="green"
          />

          <StatCard
            label="Absents"
            value={declinedCount}
            variant="red"
          />

          <StatCard
            label="En attente"
            value={
              pendingCount +
              maybeCount
            }
            variant="yellow"
          />

          <StatCard
            label="Personnes attendues"
            value={totalExpectedPeople}
            variant="pink"
            wideOnMobile
          />
        </section>

        {acceptedCount > 0 && (
          <section className="mt-4 grid gap-3 sm:grid-cols-3">
            <SmallSummary
              value={acceptedCount}
              label="invités présents"
              variant="green"
            />

            <SmallSummary
              value={totalCompanions}
              label="accompagnants"
              variant="blue"
            />

            <SmallSummary
              value={totalChildren}
              label="enfants"
              variant="purple"
            />
          </section>
        )}

        {(error || success) && (
          <section className="mt-6">
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
          </section>
        )}

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-[28px] border border-pink-100 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-28">
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />

            <h2 className="mt-5 text-xl font-bold text-gray-950">
              Ajouter un invité
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Chaque invité dispose de son
              propre lien d’invitation.
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
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
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
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
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
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                />

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  Indiquez 0 si cet invité ne
                  peut pas venir accompagné.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:from-pink-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Ajout en cours..."
                  : "Ajouter l’invité"}
              </button>
            </form>
          </section>

          <section className="min-w-0 rounded-[28px] border border-purple-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-950">
                  Liste des invités
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Consultez, modifiez ou
                  supprimez vos invités et
                  envoyez leurs invitations.
                </p>
              </div>

              <span className="w-fit rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                {guests.length} invité
                {guests.length !== 1
                  ? "s"
                  : ""}
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
                <div className="mx-auto h-1 w-16 rounded-full bg-pink-500" />

                <h3 className="mt-5 font-bold text-gray-900">
                  Aucun invité pour le moment
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  Utilisez le formulaire pour
                  ajouter votre premier invité.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {guests.map((guest) => {
                  const companionCount =
                    safeNumber(
                      guest.companionCount
                    );

                  const childrenCount =
                    safeNumber(
                      guest.childrenCount
                    );

                  const maxCompanions =
                    safeNumber(
                      guest.maxCompanions
                    );

                  const totalForInvitation =
                    1 +
                    companionCount +
                    childrenCount;

                  const invitationPath =
                    `/i/${guest.token}`;

                  const isSending =
                    sendingGuestId ===
                    guest.id;

                  const wasSent =
                    sentGuestId ===
                    guest.id;

                  const isEditing =
                    editingGuestId ===
                    guest.id;

                  const isSaving =
                    savingGuestId ===
                    guest.id;

                  const isDeleting =
                    deletingGuestId ===
                    guest.id;

                  return (
                    <article
                      key={guest.id}
                      className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:border-pink-100 hover:shadow-sm"
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 gap-3 sm:gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 font-bold text-purple-700">
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
                                  {
                                    guest.firstName
                                  }{" "}
                                  {
                                    guest.lastName
                                  }
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

                              {guest.email ? (
                                <p className="mt-1 break-all text-sm text-gray-500">
                                  {
                                    guest.email
                                  }
                                </p>
                              ) : (
                                <p className="mt-1 text-sm text-gray-400">
                                  Aucune adresse
                                  e-mail
                                </p>
                              )}

                              <p className="mt-3 text-xs text-gray-400">
                                Jusqu’à{" "}
                                {
                                  maxCompanions
                                }{" "}
                                accompagnant
                                {maxCompanions !==
                                1
                                  ? "s"
                                  : ""}{" "}
                                autorisé
                                {maxCompanions !==
                                1
                                  ? "s"
                                  : ""}
                              </p>
                            </div>
                          </div>

                          <Link
                            href={
                              invitationPath
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full shrink-0 items-center justify-center rounded-full border border-pink-200 bg-pink-50 px-4 py-2.5 text-sm font-semibold text-pink-700 transition hover:bg-pink-100 sm:w-auto"
                          >
                            Ouvrir
                            l’invitation
                          </Link>
                        </div>

                        <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row">
                          <button
                            type="button"
                            onClick={() =>
                              isEditing
                                ? cancelEditingGuest()
                                : startEditingGuest(
                                    guest
                                  )
                            }
                            disabled={
                              isDeleting
                            }
                            className="inline-flex items-center justify-center rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isEditing
                              ? "Annuler la modification"
                              : "Modifier"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteGuest(
                                guest
                              )
                            }
                            disabled={
                              deletingGuestId !==
                                null ||
                              savingGuestId !==
                                null
                            }
                            className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting
                              ? "Suppression..."
                              : "Supprimer"}
                          </button>
                        </div>

                        {isEditing && (
                          <form
                            onSubmit={(
                              event
                            ) =>
                              handleEditGuest(
                                event,
                                guest
                              )
                            }
                            className="mt-4 rounded-2xl border border-purple-100 bg-purple-50/40 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-bold text-gray-900">
                                  Modifier
                                  l’invité
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                  Le lien
                                  personnel de
                                  cet invité ne
                                  changera pas.
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              <div>
                                <label
                                  htmlFor={`edit-firstName-${guest.id}`}
                                  className="text-xs font-semibold text-gray-700"
                                >
                                  Prénom
                                </label>

                                <input
                                  id={`edit-firstName-${guest.id}`}
                                  type="text"
                                  required
                                  value={
                                    editForm.firstName
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    setEditForm(
                                      (
                                        current
                                      ) => ({
                                        ...current,
                                        firstName:
                                          event
                                            .target
                                            .value,
                                      })
                                    )
                                  }
                                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`edit-lastName-${guest.id}`}
                                  className="text-xs font-semibold text-gray-700"
                                >
                                  Nom
                                </label>

                                <input
                                  id={`edit-lastName-${guest.id}`}
                                  type="text"
                                  required
                                  value={
                                    editForm.lastName
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    setEditForm(
                                      (
                                        current
                                      ) => ({
                                        ...current,
                                        lastName:
                                          event
                                            .target
                                            .value,
                                      })
                                    )
                                  }
                                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`edit-email-${guest.id}`}
                                  className="text-xs font-semibold text-gray-700"
                                >
                                  Adresse
                                  e-mail
                                </label>

                                <input
                                  id={`edit-email-${guest.id}`}
                                  type="email"
                                  value={
                                    editForm.email
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    setEditForm(
                                      (
                                        current
                                      ) => ({
                                        ...current,
                                        email:
                                          event
                                            .target
                                            .value,
                                      })
                                    )
                                  }
                                  placeholder="Facultatif"
                                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`edit-maxCompanions-${guest.id}`}
                                  className="text-xs font-semibold text-gray-700"
                                >
                                  Accompagnants
                                  autorisés
                                </label>

                                <input
                                  id={`edit-maxCompanions-${guest.id}`}
                                  type="number"
                                  min="0"
                                  max="20"
                                  required
                                  value={
                                    editForm.maxCompanions
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    setEditForm(
                                      (
                                        current
                                      ) => ({
                                        ...current,
                                        maxCompanions:
                                          Number(
                                            event
                                              .target
                                              .value
                                          ),
                                      })
                                    )
                                  }
                                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                                />
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                              <button
                                type="button"
                                onClick={
                                  cancelEditingGuest
                                }
                                disabled={
                                  isSaving
                                }
                                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                              >
                                Annuler
                              </button>

                              <button
                                type="submit"
                                disabled={
                                  isSaving
                                }
                                className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isSaving
                                  ? "Enregistrement..."
                                  : "Enregistrer les modifications"}
                              </button>
                            </div>
                          </form>
                        )}

                        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/50 p-3 sm:p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                            Lien individuel
                          </p>

                          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                              <p className="truncate text-sm text-gray-600">
                                {typeof window !==
                                "undefined"
                                  ? `${window.location.origin}${invitationPath}`
                                  : invitationPath}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                copyInvitationLink(
                                  guest
                                )
                              }
                              className={`inline-flex shrink-0 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                copiedGuestId ===
                                guest.id
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-950 text-white hover:bg-gray-800"
                              }`}
                            >
                              {copiedGuestId ===
                              guest.id
                                ? "Lien copié"
                                : "Copier le lien"}
                            </button>
                          </div>

                          <p className="mt-2 text-xs leading-5 text-gray-500">
                            Ce lien est
                            personnel. Envoyez-le
                            uniquement à cet
                            invité.
                          </p>
                        </div>

                        <div className="mt-4 rounded-2xl border border-pink-100 bg-pink-50/50 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                Envoi par e-mail
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-500">
                                {guest.email
                                  ? "Envoyez directement cette invitation personnelle par e-mail."
                                  : "Ajoutez une adresse e-mail à cet invité pour pouvoir lui envoyer son invitation."}
                              </p>
                            </div>

                            <button
                              type="button"
                              disabled={
                                !guest.email ||
                                sendingGuestId !==
                                  null
                              }
                              onClick={() =>
                                sendInvitationEmail(
                                  guest
                                )
                              }
                              className={`inline-flex w-full shrink-0 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:w-auto ${
                                wasSent
                                  ? "bg-green-600 text-white"
                                  : "bg-pink-600 text-white hover:bg-pink-700"
                              } disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500`}
                            >
                              {isSending
                                ? "Envoi en cours..."
                                : wasSent
                                  ? "Invitation envoyée"
                                  : "Envoyer l’invitation"}
                            </button>
                          </div>
                        </div>

                        {guest.status ===
                          "accepted" && (
                          <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <GuestInfo
                              label="Invité"
                              value="1"
                              variant="green"
                            />

                            <GuestInfo
                              label="Accompagnants"
                              value={String(
                                companionCount
                              )}
                              variant="blue"
                            />

                            <GuestInfo
                              label="Enfants"
                              value={String(
                                childrenCount
                              )}
                              variant="purple"
                            />
                          </div>
                        )}

                        {guest.status ===
                          "accepted" &&
                          childrenCount >
                            0 && (
                            <div className="mt-3 rounded-2xl border border-purple-100 bg-purple-50/70 px-4 py-3">
                              <p className="text-sm font-semibold text-purple-700">
                                {childrenCount ===
                                1
                                  ? "1 enfant"
                                  : `${childrenCount} enfants`}
                              </p>

                              {guest.childrenAges && (
                                <p className="mt-1 break-words text-sm text-gray-600">
                                  {childrenCount ===
                                  1
                                    ? "Âge"
                                    : "Âges"}{" "}
                                  :{" "}
                                  {
                                    guest.childrenAges
                                  }
                                </p>
                              )}
                            </div>
                          )}

                        {guest.status ===
                          "accepted" && (
                          <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-green-100 bg-green-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-medium text-green-700">
                              {companionCount ===
                              0
                                ? "Vient seul(e)"
                                : companionCount ===
                                    1
                                  ? "Vient avec 1 accompagnant"
                                  : `Vient avec ${companionCount} accompagnants`}
                            </p>

                            <p className="text-xs font-semibold text-gray-600">
                              Total :{" "}
                              {
                                totalForInvitation
                              }{" "}
                              personne
                              {totalForInvitation !==
                              1
                                ? "s"
                                : ""}
                            </p>
                          </div>
                        )}

                        {guest.answers &&
                          guest.answers.length >
                            0 && (
                            <div className="mt-5 border-t border-gray-100 pt-5">
                              <p className="text-sm font-bold text-gray-900">
                                Réponses
                                personnalisées
                              </p>

                              <div className="mt-3 grid gap-3 md:grid-cols-2">
                                {guest.answers.map(
                                  (
                                    answer
                                  ) => (
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
            className="inline-flex rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-pink-200 hover:text-pink-600"
          >
            Retour à l’événement
          </Link>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  variant = "default",
  wideOnMobile = false,
}: {
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
      card: "bg-white border-gray-100",
      line: "bg-gray-300",
      value: "text-gray-950",
    },
    green: {
      card:
        "bg-green-50/70 border-green-100",
      line: "bg-green-500",
      value: "text-green-700",
    },
    red: {
      card:
        "bg-red-50/70 border-red-100",
      line: "bg-red-500",
      value: "text-red-700",
    },
    yellow: {
      card:
        "bg-yellow-50/70 border-yellow-100",
      line: "bg-yellow-500",
      value: "text-yellow-700",
    },
    pink: {
      card:
        "bg-pink-50/80 border-pink-100",
      line: "bg-pink-500",
      value: "text-pink-700",
    },
  };

  const style = styles[variant];

  return (
    <div
      className={`min-w-0 rounded-2xl border p-4 shadow-sm sm:p-5 ${
        style.card
      } ${
        wideOnMobile
          ? "col-span-2 lg:col-span-1"
          : ""
      }`}
    >
      <div
        className={`h-1 w-8 rounded-full ${style.line}`}
      />

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
  value,
  label,
  variant,
}: {
  value: number;
  label: string;
  variant:
    | "green"
    | "blue"
    | "purple";
}) {
  const styles = {
    green:
      "border-green-100 bg-green-50 text-green-700",
    blue:
      "border-blue-100 bg-blue-50 text-blue-700",
    purple:
      "border-purple-100 bg-purple-50 text-purple-700",
  };

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${styles[variant]}`}
    >
      <p className="text-xl font-bold">
        {value}
      </p>

      <p className="mt-1 break-words text-xs opacity-80">
        {label}
      </p>
    </div>
  );
}

function GuestInfo({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant:
    | "green"
    | "blue"
    | "purple";
}) {
  const styles = {
    green:
      "border-green-100 bg-green-50 text-green-700",
    blue:
      "border-blue-100 bg-blue-50 text-blue-700",
    purple:
      "border-purple-100 bg-purple-50 text-purple-700",
  };

  return (
    <div
      className={`rounded-2xl border p-3 ${styles[variant]}`}
    >
      <p className="text-xs opacity-75">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}