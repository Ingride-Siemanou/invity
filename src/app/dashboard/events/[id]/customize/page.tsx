"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type ThemeId =
  | "elegant"
  | "romantic"
  | "modern"
  | "festive";

type EventData = {
  id: number;
  title: string;
  eventType: string;
  invitationTheme: ThemeId;
  invitationColor: string;
  coverImageUrl: string | null;
};

const themes: {
  id: ThemeId;
  name: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "elegant",
    name: "Élégant",
    icon: "✨",
    description: "Sobre, raffiné et intemporel.",
  },
  {
    id: "romantic",
    name: "Romantique",
    icon: "🌸",
    description:
      "Doux et délicat pour une ambiance chaleureuse.",
  },
  {
    id: "modern",
    name: "Moderne",
    icon: "◼",
    description: "Minimaliste, épuré et contemporain.",
  },
  {
    id: "festive",
    name: "Festif",
    icon: "🎉",
    description:
      "Coloré et joyeux pour célébrer en grand.",
  },
];

const presetColors = [
  { name: "Rose", value: "#DB2777" },
  { name: "Vieux rose", value: "#BE6B7A" },
  { name: "Bordeaux", value: "#881337" },
  { name: "Violet", value: "#9333EA" },
  { name: "Lavande", value: "#A78BFA" },
  { name: "Bleu", value: "#2563EB" },
  { name: "Bleu nuit", value: "#1E3A8A" },
  { name: "Turquoise", value: "#0D9488" },
  { name: "Vert", value: "#059669" },
  { name: "Sauge", value: "#7C9070" },
  { name: "Doré", value: "#D4A017" },
  { name: "Terracotta", value: "#C65D3B" },
  { name: "Orange", value: "#EA580C" },
  { name: "Rouge", value: "#DC2626" },
  { name: "Brun", value: "#795548" },
  { name: "Noir", value: "#111827" },
];

const legacyColors: Record<string, string> = {
  rose: "#DB2777",
  purple: "#9333EA",
  blue: "#2563EB",
  green: "#059669",
  gold: "#D4A017",
  black: "#111827",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function normalizeColor(
  value: string | null | undefined
) {
  if (!value) {
    return "#DB2777";
  }

  if (legacyColors[value]) {
    return legacyColors[value];
  }

  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return value.toUpperCase();
  }

  return "#DB2777";
}

function hexToRgba(hex: string, opacity: number) {
  const normalized = hex.replace("#", "");

  const red = parseInt(
    normalized.substring(0, 2),
    16
  );
  const green = parseInt(
    normalized.substring(2, 4),
    16
  );
  const blue = parseInt(
    normalized.substring(4, 6),
    16
  );

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function getThemePreviewClass(theme: ThemeId) {
  if (theme === "romantic") {
    return "rounded-[36px]";
  }

  if (theme === "modern") {
    return "rounded-none";
  }

  if (theme === "festive") {
    return "rounded-[28px]";
  }

  return "rounded-[32px]";
}

function getThemeTitleClass(theme: ThemeId) {
  if (theme === "romantic") {
    return "font-serif italic";
  }

  if (theme === "modern") {
    return "uppercase tracking-[0.08em]";
  }

  if (theme === "festive") {
    return "font-extrabold";
  }

  return "font-serif";
}

export default function CustomizeInvitationPage() {
  const params = useParams();
  const id = params.id as string;

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [event, setEvent] =
    useState<EventData | null>(null);

  const [theme, setTheme] =
    useState<ThemeId>("elegant");

  const [color, setColor] =
    useState("#DB2777");

  const [coverImageUrl, setCoverImageUrl] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    async function loadEvent() {
      try {
        setError("");

        const response = await fetch(
          `/api/events/${id}`
        );

        const result = await response.json();

        if (!response.ok) {
          setError(
            result.error ||
              "Impossible de charger la personnalisation."
          );
          return;
        }

        const loadedEvent =
          result.event as EventData;

        setEvent(loadedEvent);

        setTheme(
          loadedEvent.invitationTheme ||
            "elegant"
        );

        setColor(
          normalizeColor(
            loadedEvent.invitationColor
          )
        );

        setCoverImageUrl(
          loadedEvent.coverImageUrl || ""
        );
      } catch {
        setError(
          "Impossible de charger la personnalisation pour le moment."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  async function saveCustomization() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/events/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            invitationTheme: theme,
            invitationColor: color,
            coverImageUrl,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Impossible d’enregistrer la personnalisation."
        );
        return;
      }

      const savedCoverImageUrl =
        result.event?.coverImageUrl || "";

      setEvent((currentEvent) =>
        currentEvent
          ? {
              ...currentEvent,
              invitationTheme: theme,
              invitationColor: color,
              coverImageUrl:
                savedCoverImageUrl ||
                null,
            }
          : currentEvent
      );

      setCoverImageUrl(
        savedCoverImageUrl
      );

      setSuccess(
        "Personnalisation enregistrée avec succès !"
      );
    } catch {
      setError(
        "Impossible d’enregistrer la personnalisation pour le moment."
      );
    } finally {
      setSaving(false);
    }
  }

  function selectColor(newColor: string) {
    setColor(newColor.toUpperCase());
    setSuccess("");
    setError("");
  }

  function openFilePicker() {
    if (uploading) {
      return;
    }

    fileInputRef.current?.click();
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    /*
     * On remet immédiatement la valeur à vide.
     * Cela permet de sélectionner à nouveau
     * exactement la même photo plus tard.
     */
    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type
      )
    ) {
      setError(
        "Format non accepté. Choisissez une image JPG, PNG ou WebP."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "La photo ne doit pas dépasser 10 Mo."
      );
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "/api/cloudinary/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Impossible d’envoyer la photo."
        );
        return;
      }

      if (
        typeof result.url !== "string" ||
        !result.url
      ) {
        setError(
          "Cloudinary n’a pas retourné l’adresse de la photo."
        );
        return;
      }

      setCoverImageUrl(result.url);

      setSuccess(
        "Photo envoyée avec succès ! Pensez maintenant à enregistrer la personnalisation."
      );
    } catch {
      setError(
        "Impossible d’envoyer la photo pour le moment."
      );
    } finally {
      setUploading(false);
    }
  }

  function removeCoverImage() {
    setCoverImageUrl("");

    setSuccess(
      "Photo retirée de l’invitation. Cliquez sur « Enregistrer la personnalisation » pour confirmer."
    );

    setError("");
  }

  const softColor =
    hexToRgba(color, 0.08);

  const mediumColor =
    hexToRgba(color, 0.2);

  return (
    <main className="min-h-screen bg-[#f8f8fb] text-gray-900">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="min-w-0"
          >
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
        <section className="relative overflow-hidden rounded-[28px] bg-gray-950 px-5 py-8 text-white shadow-xl sm:rounded-[36px] sm:px-8 sm:py-10 lg:px-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-600/20 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-pink-300">
              Personnalisation
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Créez votre invitation 🎨
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base sm:leading-7">
              Choisissez le style, les
              couleurs et la photo de
              couverture de votre
              invitation. Visualisez le
              résultat en direct avant de
              l’enregistrer.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-pink-600" />

            <p className="mt-4 text-sm text-gray-500">
              Chargement de votre
              invitation...
            </p>
          </div>
        ) : error && !event ? (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : event ? (
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-6">
              {/* THÈME */}
              <section className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
                  Étape 1
                </p>

                <h2 className="mt-2 text-xl font-bold text-gray-950 sm:text-2xl">
                  Choisissez un thème
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Le thème définit
                  l’ambiance générale de
                  votre invitation.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {themes.map((item) => {
                    const selected =
                      theme === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setTheme(item.id);
                          setSuccess("");
                          setError("");
                        }}
                        className={`min-w-0 rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-pink-400 bg-pink-50 ring-2 ring-pink-100"
                            : "border-gray-200 bg-white hover:border-pink-200 hover:bg-pink-50/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${
                              selected
                                ? "bg-pink-100"
                                : "bg-gray-100"
                            }`}
                          >
                            {item.icon}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-gray-950">
                                {item.name}
                              </p>

                              {selected && (
                                <span className="rounded-full bg-pink-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                  Sélectionné
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs leading-5 text-gray-500">
                              {
                                item.description
                              }
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* COULEUR */}
              <section className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
                  Étape 2
                </p>

                <h2 className="mt-2 text-xl font-bold text-gray-950 sm:text-2xl">
                  Choisissez votre couleur
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Sélectionnez une couleur
                  proposée ou créez
                  exactement la couleur que
                  vous souhaitez.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {presetColors.map(
                    (item) => {
                      const selected =
                        color.toUpperCase() ===
                        item.value.toUpperCase();

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() =>
                            selectColor(
                              item.value
                            )
                          }
                          className={`min-w-0 rounded-2xl border p-3 text-center transition ${
                            selected
                              ? "border-gray-950 bg-gray-50 ring-2 ring-gray-100"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span
                            className="mx-auto block h-10 w-10 rounded-full border-4 border-white shadow-md"
                            style={{
                              backgroundColor:
                                item.value,
                            }}
                          />

                          <p className="mt-2 truncate text-xs font-semibold text-gray-800">
                            {item.name}
                          </p>

                          {selected && (
                            <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-gray-400">
                              Sélectionnée
                            </p>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>

                <div className="mt-6 rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-gray-950">
                        🎨 Couleur
                        personnalisée
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Choisissez librement
                        votre propre couleur.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-full border-4 border-white shadow-md">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) =>
                            selectColor(
                              e.target.value
                            )
                          }
                          className="absolute -inset-2 h-20 w-20 cursor-pointer border-0 p-0"
                          aria-label="Choisir une couleur personnalisée"
                        />
                      </label>

                      <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          Couleur
                        </p>

                        <p className="mt-0.5 font-mono text-sm font-bold text-gray-800">
                          {color.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* PHOTO */}
              <section className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
                  Étape 3
                </p>

                <h2 className="mt-2 text-xl font-bold text-gray-950 sm:text-2xl">
                  Photo de couverture
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Ajoutez une photo qui
                  apparaîtra en haut de
                  votre invitation.
                  Choisissez de préférence
                  une photo horizontale et
                  de bonne qualité.
                </p>

                {coverImageUrl ? (
                  <div className="mt-6">
                    <div className="relative overflow-hidden rounded-[24px] bg-gray-100">
                      <img
                        src={coverImageUrl}
                        alt="Photo de couverture de l’invitation"
                        className="h-56 w-full object-cover sm:h-72"
                      />

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                        <p className="text-sm font-semibold text-white">
                          Photo de couverture
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={
                          openFilePicker
                        }
                        disabled={
                          uploading ||
                          saving
                        }
                        className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-pink-300 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {uploading
                          ? "⏳ Envoi en cours..."
                          : "📷 Remplacer la photo"}
                      </button>

                      <button
                        type="button"
                        onClick={
                          removeCoverImage
                        }
                        disabled={
                          uploading ||
                          saving
                        }
                        className="w-full rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        🗑️ Retirer la photo
                      </button>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-gray-400">
                      JPG, PNG ou WebP ·
                      10 Mo maximum.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={
                      uploading || saving
                    }
                    className="mt-6 flex min-h-48 w-full flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center transition hover:border-pink-300 hover:bg-pink-50/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploading ? (
                      <>
                        <span className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-pink-600" />

                        <span className="mt-4 font-bold text-gray-950">
                          Envoi de la photo...
                        </span>

                        <span className="mt-2 max-w-sm text-xs leading-5 text-gray-500">
                          Patientez quelques
                          secondes pendant
                          l’envoi vers
                          Cloudinary.
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                          📷
                        </span>

                        <span className="mt-4 font-bold text-gray-950">
                          Ajouter une photo
                        </span>

                        <span className="mt-2 max-w-sm text-xs leading-5 text-gray-500">
                          Choisissez une
                          image depuis votre
                          téléphone ou votre
                          ordinateur.
                        </span>

                        <span className="mt-3 text-[11px] font-medium text-gray-400">
                          JPG, PNG ou WebP ·
                          10 Mo maximum
                        </span>
                      </>
                    )}
                  </button>
                )}
              </section>

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
                type="button"
                onClick={
                  saveCustomization
                }
                disabled={
                  saving || uploading
                }
                className="w-full rounded-full bg-pink-600 px-6 py-4 font-semibold text-white shadow-sm transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving
                  ? "Enregistrement..."
                  : "Enregistrer la personnalisation"}
              </button>
            </div>

            {/* APERÇU */}
            <aside className="lg:sticky lg:top-28">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                    Aperçu
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    Invitation de vos
                    invités
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 shadow-sm">
                  En direct
                </span>
              </div>

              <div className="rounded-[32px] bg-gray-200/70 p-3 shadow-inner sm:p-4">
                <div
                  className={`overflow-hidden bg-white shadow-xl ${getThemePreviewClass(
                    theme
                  )}`}
                >
                  {coverImageUrl && (
                    <div className="relative h-48 w-full sm:h-56">
                      <img
                        src={coverImageUrl}
                        alt="Aperçu de la photo de couverture"
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}

                  {theme ===
                    "festive" && (
                    <div className="flex justify-center gap-3 bg-gray-50 py-3 text-lg">
                      <span>✨</span>
                      <span>🎉</span>
                      <span>✨</span>
                    </div>
                  )}

                  <div
                    className="h-2"
                    style={{
                      backgroundColor:
                        color,
                    }}
                  />

                  <div className="px-5 py-8 text-center sm:px-7 sm:py-10">
                    <div
                      className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                      style={{
                        backgroundColor:
                          softColor,
                      }}
                    >
                      ✉️
                    </div>

                    <p
                      className="mt-6 text-xs font-bold uppercase tracking-[0.2em]"
                      style={{ color }}
                    >
                      Vous êtes invité(e)
                    </p>

                    <h2
                      className={`mx-auto mt-3 max-w-xs break-words text-3xl text-gray-950 ${getThemeTitleClass(
                        theme
                      )}`}
                    >
                      {event.title}
                    </h2>

                    <div
                      className="mx-auto mt-6 h-px w-16"
                      style={{
                        backgroundColor:
                          color,
                      }}
                    />

                    <p className="mt-6 text-sm leading-6 text-gray-500">
                      Nous serions heureux
                      de partager ce moment
                      avec vous.
                    </p>

                    <div className="mt-7 space-y-3">
                      <div
                        className="rounded-2xl border px-4 py-3"
                        style={{
                          borderColor:
                            mediumColor,
                          backgroundColor:
                            softColor,
                        }}
                      >
                        <p className="text-xs text-gray-500">
                          Votre invitation
                        </p>

                        <p className="mt-1 text-sm font-bold text-gray-900">
                          Réponse à
                          l’invitation
                        </p>
                      </div>

                      <div
                        className="rounded-full px-5 py-3 text-sm font-semibold text-white"
                        style={{
                          backgroundColor:
                            color,
                        }}
                      >
                        Présent(e)
                      </div>

                      <div className="rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700">
                        Absent(e)
                      </div>
                    </div>

                    <p className="mt-8 text-[11px] text-gray-400">
                      Invity — Créez.
                      Invitez. Célébrez.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                Cet aperçu sera ensuite
                appliqué à la véritable
                invitation publique.
              </p>
            </aside>
          </div>
        ) : null}

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