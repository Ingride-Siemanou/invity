import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-10 text-center">
          <Link href="/" className="text-3xl font-bold text-pink-600">
            Invity
          </Link>

          <p className="mt-2 text-gray-600">
            Choisissez un nouveau mot de passe
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Nouveau mot de passe
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Saisissez votre nouveau mot de passe puis confirmez-le.
          </p>

          <form className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nouveau mot de passe
              </label>

              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirmer le mot de passe
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-pink-600 py-3.5 font-semibold text-white transition hover:bg-pink-700"
            >
              Modifier mon mot de passe
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Retour à la{" "}
            <Link
              href="/login"
              className="font-semibold text-pink-600 hover:text-pink-700"
            >
              connexion
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}