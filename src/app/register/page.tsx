export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-md">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="text-3xl font-bold text-pink-600">Invity</div>
          <p className="mt-2 text-gray-600">
            Créez votre compte gratuitement
          </p>
        </div>

        {/* Formulaire */}
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Créer un compte
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Quelques informations pour commencer.
          </p>

          <form className="mt-8 space-y-5">
            {/* Prénom */}
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Prénom
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Jean"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            {/* Nom */}
            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nom
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Dupont"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            {/* Email */}
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
                placeholder="jean@exemple.fr"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            {/* Mot de passe */}
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
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            {/* Bouton */}
            <button
              type="submit"
              className="w-full rounded-xl bg-pink-600 py-3.5 font-semibold text-white transition hover:bg-pink-700"
            >
              Créer mon compte
            </button>
          </form>

          {/* Connexion */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Vous avez déjà un compte ?{" "}
            <a
              href="/login"
              className="font-semibold text-pink-600 hover:text-pink-700"
            >
              Se connecter
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          En créant un compte, vous acceptez nos conditions d'utilisation.
        </p>
      </div>
    </main>
  );
}