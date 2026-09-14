import Link from "next/link";

export default function LoginPage() {
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

          <form className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Adresse e-mail
              </label>

              <input
                id="email"
                type="email"
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
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-pink-600 py-3.5 font-semibold text-white transition hover:bg-pink-700"
            >
              Se connecter
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