"use client";

import {
  FormEvent,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");
  const [loading, setLoading] =
    useState(false);

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
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch(
        "/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Une erreur est survenue."
        );
        return;
      }

      setSuccess(
        "Connexion réussie."
      );

      form.reset();

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(
        "Impossible de se connecter pour le moment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-md">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block text-3xl font-bold text-pink-600 transition hover:text-pink-700"
          >
            Invity
          </Link>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Heureux de vous revoir
          </p>
        </div>

        {/* Carte */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-pink-100/40">
          <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />

          <div className="p-5 sm:p-8">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
                Votre espace Invity
              </p>

              <h1 className="mt-2 text-2xl font-bold text-gray-950 sm:text-3xl">
                Se connecter
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Connectez-vous pour retrouver
                vos événements et gérer vos
                invitations.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* E-mail */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Adresse e-mail
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="jean@exemple.fr"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Mot de passe
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Votre mot de passe"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                />

                <div className="mt-3 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-pink-600 transition hover:text-pink-700"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                >
                  {error}
                </div>
              )}

              {/* Succès */}
              {success && (
                <div
                  role="status"
                  className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
                >
                  {success}
                </div>
              )}

              {/* Connexion */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:from-pink-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Connexion..."
                  : "Se connecter"}
              </button>
            </form>

            {/* Inscription */}
            <div className="mt-7 border-t border-gray-100 pt-6 text-center">
              <p className="text-sm text-gray-500">
                Vous n&apos;avez pas encore
                de compte ?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-pink-600 transition hover:text-pink-700"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Retour accueil */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 transition hover:text-pink-600"
          >
            Retour à l’accueil
          </Link>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-gray-400">
          Invity — Créez. Invitez.
          Célébrez.
        </p>
      </div>
    </main>
  );
}