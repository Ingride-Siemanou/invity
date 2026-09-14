"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

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
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("/api/login", {
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

      setSuccess("Connexion réussie !");
      form.reset();

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Impossible de se connecter pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-10 text-center">
          <Link href="/" className="text-3xl font-bold text-pink-600">
            Invity
          </Link>

          <p className="mt-2 text-gray-600">
            Heureux de vous revoir
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Se connecter
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Connectez-vous à votre espace Invity.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                required
                placeholder="jean@exemple.fr"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>

              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-pink-600 hover:text-pink-700"
              >
                Mot de passe oublié ?
              </Link>
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
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Vous n'avez pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-semibold text-pink-600 hover:text-pink-700"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}