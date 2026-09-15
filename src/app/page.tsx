import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="text-2xl font-bold tracking-tight text-pink-600">
          Invity
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="rounded-full px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Se connecter
          </Link>

          <Link
            href="/register"
            className="rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white hover:bg-pink-700"
          >
            Créer mon invitation
          </Link>
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
            <span className="text-pink-600">
              qui vous ressemble.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Avec Invity, créez de magnifiques invitations
            numériques, invitez vos proches avec un lien
            personnalisé et recevez leurs réponses en toute
            simplicité.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-pink-600 px-8 py-4 font-semibold text-white shadow-lg hover:bg-pink-700"
            >
              Créer mon invitation
            </Link>

            <Link
              href="#fonctionnalites"
              className="rounded-full border border-gray-300 px-8 py-4 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Découvrir Invity
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Mariage · Anniversaire · Baptême · Fête · Événement
            professionnel
          </p>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section
        id="fonctionnalites"
        className="scroll-mt-8 bg-gray-50 px-6 py-20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
              Simple et pratique
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Tout ce qu&apos;il vous faut pour inviter
            </h2>

            <p className="mt-4 text-gray-600">
              Simple pour vous, agréable pour vos invités.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-3xl">💌</div>

              <h3 className="mt-4 text-xl font-semibold">
                Une invitation personnalisée
              </h3>

              <p className="mt-3 text-gray-600">
                Créez votre événement et ajoutez toutes les
                informations importantes pour vos invités.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-3xl">🔗</div>

              <h3 className="mt-4 text-xl font-semibold">
                Un lien pour chaque invité
              </h3>

              <p className="mt-3 text-gray-600">
                Chaque personne reçoit son propre lien
                d&apos;invitation personnalisé et peut répondre
                sans créer de compte.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="text-3xl">📊</div>

              <h3 className="mt-4 text-xl font-semibold">
                Suivez les réponses
              </h3>

              <p className="mt-3 text-gray-600">
                Consultez les présences, les absences, les
                accompagnants et les réponses personnalisées
                depuis votre espace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
              Comment ça marche ?
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Votre invitation en quelques étapes
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-600 font-bold text-white">
                1
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Créez votre événement
              </h3>

              <p className="mt-2 text-gray-600">
                Indiquez la date, le lieu et les informations
                importantes de votre événement.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-600 font-bold text-white">
                2
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Ajoutez vos invités
              </h3>

              <p className="mt-2 text-gray-600">
                Invity génère un lien individuel pour chaque
                personne invitée.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-600 font-bold text-white">
                3
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Recevez leurs réponses
              </h3>

              <p className="mt-2 text-gray-600">
                Retrouvez les réponses de vos invités directement
                dans votre tableau de bord.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="bg-pink-50 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Prêt à créer votre invitation ?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Créez votre compte Invity et commencez à préparer
            votre événement.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-full bg-pink-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-pink-700"
          >
            Créer mon invitation
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-8 py-8 text-center text-sm text-gray-500">
        © 2026 Invity — Créez. Invitez. Célébrez.
      </footer>
    </main>
  );
}