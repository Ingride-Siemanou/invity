export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="text-2xl font-bold tracking-tight text-pink-600">
          Invity
        </div>

        <div className="flex items-center gap-4">
          <button className="rounded-full px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Se connecter
          </button>

          <button className="rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white hover:bg-pink-700">
            Créer mon invitation
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex min-h-[75vh] items-center justify-center px-6">
        <div className="max-w-4xl text-center">
          <div className="mb-6 inline-block rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600">
            ✨ Vos événements, vos invitations, votre moment
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Créez une invitation
            <br />
            <span className="text-pink-600">qui vous ressemble.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Avec Invity, créez de magnifiques invitations numériques,
            invitez vos proches avec un lien personnalisé et recevez leurs
            réponses en toute simplicité.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <button className="rounded-full bg-pink-600 px-8 py-4 font-semibold text-white shadow-lg hover:bg-pink-700">
              Créer mon invitation
            </button>

            <button className="rounded-full border border-gray-300 px-8 py-4 font-semibold text-gray-700 hover:bg-gray-50">
              Découvrir Invity
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Mariage · Anniversaire · Baptême · Fête · Événement professionnel
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              Tout ce qu'il vous faut pour inviter
            </h2>

            <p className="mt-4 text-gray-600">
              Simple pour vous, agréable pour vos invités.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-3xl">💌</div>
              <h3 className="mt-4 text-xl font-semibold">
                Une belle invitation
              </h3>
              <p className="mt-3 text-gray-600">
                Personnalisez votre invitation selon votre événement et votre
                style.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-3xl">🔗</div>
              <h3 className="mt-4 text-xl font-semibold">
                Un lien pour chaque invité
              </h3>
              <p className="mt-3 text-gray-600">
                Chaque personne reçoit son propre lien d'invitation
                personnalisé.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-3xl">📊</div>
              <h3 className="mt-4 text-xl font-semibold">
                Suivez les réponses
              </h3>
              <p className="mt-3 text-gray-600">
                Retrouvez toutes les réponses de vos invités directement dans
                votre espace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-8 py-8 text-center text-sm text-gray-500">
        © 2026 Invity — Créez. Invitez. Célébrez.
      </footer>
    </main>
  );
}