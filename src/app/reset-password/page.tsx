import Link from "next/link";

export default function ResetPasswordPage() {
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
            Choisissez un nouveau mot de passe
          </p>
        </div>

        {/* Carte */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-pink-100/40">
          <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />

          <div className="p-5 sm:p-8">
            {/* Introduction */}
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
                Sécurité du compte
              </p>

              <h1 className="mt-2 text-2xl font-bold text-gray-950 sm:text-3xl">
                Nouveau mot de passe
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Saisissez votre nouveau mot de passe
                puis confirmez-le pour sécuriser votre
                compte Invity.
              </p>
            </div>

            {/* Formulaire */}
            <form className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Nouveau mot de passe
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Votre nouveau mot de passe"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Minimum 8 caractères.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Confirmer le mot de passe
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Confirmez votre mot de passe"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:from-pink-700 hover:to-purple-700"
              >
                Modifier mon mot de passe
              </button>
            </form>

            {/* Connexion */}
            <div className="mt-7 border-t border-gray-100 pt-6 text-center">
              <p className="text-sm text-gray-500">
                Vous vous souvenez de votre mot de passe ?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-pink-600 transition hover:text-pink-700"
                >
                  Se connecter
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
          Invity — Créez. Invitez. Célébrez.
        </p>
      </div>
    </main>
  );
}