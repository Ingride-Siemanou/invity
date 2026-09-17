import Link from "next/link";

export default function ForgotPasswordPage() {
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
            Réinitialisez votre mot de passe
          </p>
        </div>

        {/* Carte */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-pink-100/40">
          {/* Bande colorée */}
          <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />

          <div className="p-5 sm:p-8">
            {/* Introduction */}
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
                Récupération du compte
              </p>

              <h1 className="mt-2 text-2xl font-bold text-gray-950 sm:text-3xl">
                Mot de passe oublié ?
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Entrez l’adresse e-mail associée à votre compte.
                Nous vous enverrons un lien pour choisir un nouveau
                mot de passe.
              </p>
            </div>

            {/* Formulaire */}
            <form className="space-y-5">
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

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:from-pink-700 hover:to-purple-700"
              >
                Envoyer le lien
              </button>
            </form>

            {/* Retour connexion */}
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