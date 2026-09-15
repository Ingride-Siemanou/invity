import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group">
            <div className="text-2xl font-bold tracking-tight text-pink-600">
              Invity
            </div>
            <div className="text-[10px] font-medium tracking-wide text-gray-400">
              Créez. Invitez. Célébrez.
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <Link
              href="#fonctionnalites"
              className="transition hover:text-pink-600"
            >
              Fonctionnalités
            </Link>

            <Link
              href="#comment-ca-marche"
              className="transition hover:text-pink-600"
            >
              Comment ça marche
            </Link>

            <Link
              href="#evenements"
              className="transition hover:text-pink-600"
            >
              Événements
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Se connecter
            </Link>

            <Link
              href="/register"
              className="hidden rounded-full bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 sm:block"
            >
              Créer une invitation
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-20 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-pink-100 opacity-50 blur-3xl" />

        <div className="mx-auto grid min-h-[780px] max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-700">
              <span>✦</span>
              L’invitation digitale, simplement
            </div>

            <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight text-gray-950 sm:text-6xl lg:text-7xl">
              Vos plus beaux moments commencent par une{" "}
              <span className="text-pink-600">belle invitation.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-600">
              Créez votre événement, invitez chaque personne avec
              un lien individuel et suivez toutes les réponses depuis
              un seul espace.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full bg-pink-600 px-7 py-4 text-center font-semibold text-white shadow-lg shadow-pink-100 transition hover:-translate-y-0.5 hover:bg-pink-700"
              >
                Créer mon invitation
              </Link>

              <Link
                href="#comment-ca-marche"
                className="rounded-full border border-gray-200 bg-white px-7 py-4 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Découvrir Invity
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
              <span>✓ Sans compte pour les invités</span>
              <span>✓ Liens individuels</span>
              <span>✓ Réponses centralisées</span>
            </div>
          </div>

          {/* Aperçu de l'application */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-pink-100 blur-2xl" />
            <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-purple-100 blur-2xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-gray-100 bg-white p-5 shadow-2xl shadow-gray-200/70 sm:p-7">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div>
                  <p className="text-sm font-bold text-pink-600">
                    Invity
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Aperçu de votre événement
                  </p>
                </div>

                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-300" />
                </div>
              </div>

              <div className="mt-6 rounded-3xl bg-gradient-to-br from-pink-50 to-white p-6">
                <div className="text-3xl">💍</div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-pink-600">
                  Vous êtes invité(e)
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  Notre belle journée
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Samedi 20 juin • 15:00
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Paris, France
                </p>

                <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-gray-900">
                    Serez-vous présent(e) ?
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-pink-600 px-3 py-3 text-center text-xs font-semibold text-white">
                      Oui, avec plaisir
                    </div>

                    <div className="rounded-xl border border-gray-200 px-3 py-3 text-center text-xs font-semibold text-gray-600">
                      Non
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-xs text-green-700">Présents</p>
                  <p className="mt-1 text-xl font-bold text-green-700">
                    42
                  </p>
                </div>

                <div className="rounded-2xl bg-yellow-50 p-4">
                  <p className="text-xs text-yellow-700">
                    En attente
                  </p>
                  <p className="mt-1 text-xl font-bold text-yellow-700">
                    8
                  </p>
                </div>

                <div className="rounded-2xl bg-pink-50 p-4">
                  <p className="text-xs text-pink-700">Total</p>
                  <p className="mt-1 text-xl font-bold text-pink-700">
                    58
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types d'événements */}
      <section
        id="evenements"
        className="border-y border-gray-100 bg-gray-50 px-6 py-10"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-medium text-gray-500">
            Une invitation pour tous les moments qui comptent
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {[
              ["💍", "Mariage"],
              ["🎂", "Anniversaire"],
              ["🕊️", "Baptême"],
              ["🎉", "Fête"],
              ["🥂", "Cérémonie"],
              ["💼", "Professionnel"],
            ].map(([icon, label]) => (
              <div
                key={label}
                className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm"
              >
                <span className="mr-2">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section
        id="fonctionnalites"
        className="scroll-mt-24 px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
              Tout au même endroit
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Inviter devient beaucoup plus simple.
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              De la création de votre événement jusqu’aux réponses
              de vos invités, Invity vous aide à garder une vision
              claire de votre liste.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="✉️"
              title="Invitations personnalisées"
              description="Présentez votre événement avec sa date, son lieu, son dress code et toutes les informations importantes."
            />

            <FeatureCard
              icon="🔗"
              title="Un lien individuel"
              description="Chaque invité dispose de son propre lien et peut répondre sans avoir besoin de créer un compte."
            />

            <FeatureCard
              icon="📊"
              title="Tableau de bord"
              description="Suivez les présents, les absents, les réponses en attente et le nombre réel de personnes attendues."
            />

            <FeatureCard
              icon="👨‍👩‍👧"
              title="Accompagnants et enfants"
              description="Définissez les règles de votre événement et connaissez précisément le nombre d’accompagnants et d’enfants."
            />

            <FeatureCard
              icon="❓"
              title="Questions sur mesure"
              description="Ajoutez les questions dont vous avez besoin et adaptez le formulaire de réponse à votre événement."
            />

            <FeatureCard
              icon="✨"
              title="Une expérience simple"
              description="Vos invités répondent rapidement depuis leur téléphone, sans inscription et sans parcours compliqué."
            />
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section
        id="comment-ca-marche"
        className="scroll-mt-24 bg-gray-950 px-6 py-24 text-white"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-400">
              Comment ça marche ?
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              De votre idée aux réponses de vos invités.
            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              Quelques étapes suffisent pour créer votre événement
              et commencer à recevoir les réponses.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <StepCard
              number="01"
              title="Créez votre événement"
              description="Ajoutez le nom, la date, le lieu et les informations utiles pour vos invités."
            />

            <StepCard
              number="02"
              title="Ajoutez vos invités"
              description="Créez votre liste. Invity génère un lien personnel pour chaque personne."
            />

            <StepCard
              number="03"
              title="Suivez les réponses"
              description="Présences, accompagnants, enfants et réponses personnalisées apparaissent dans votre tableau de bord."
            />
          </div>
        </div>
      </section>

      {/* Expérience organisateur */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
              Pour l’organisateur
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Une vision claire de votre événement.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-gray-600">
              Plus besoin de rechercher les réponses dans plusieurs
              conversations. Votre tableau de bord rassemble les
              informations essentielles en un seul endroit.
            </p>

            <div className="mt-8 space-y-4">
              <CheckItem text="Nombre de présents et d’absents" />
              <CheckItem text="Accompagnants et enfants inclus dans le total" />
              <CheckItem text="Réponses aux questions personnalisées" />
              <CheckItem text="Suivi des invités qui n’ont pas encore répondu" />
            </div>

            <Link
              href="/register"
              className="mt-9 inline-flex rounded-full bg-gray-950 px-7 py-4 font-semibold text-white transition hover:bg-gray-800"
            >
              Commencer avec Invity
            </Link>
          </div>

          <div className="rounded-[32px] bg-pink-50 p-6 sm:p-9">
            <div className="rounded-3xl bg-white p-6 shadow-xl shadow-pink-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Tableau de bord
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    Mon événement
                  </p>
                </div>

                <div className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  72% répondu
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <DashboardStat
                  label="Invités"
                  value="65"
                />
                <DashboardStat
                  label="Présents"
                  value="42"
                />
                <DashboardStat
                  label="En attente"
                  value="15"
                />
                <DashboardStat
                  label="Personnes attendues"
                  value="58"
                />
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>Réponses reçues</span>
                  <span>72%</span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-[72%] rounded-full bg-pink-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-gradient-to-br from-pink-600 to-pink-500 px-6 py-16 text-center text-white shadow-xl shadow-pink-100 sm:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-100">
            Votre prochain événement
          </p>

          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Créez une invitation dont vos invités se souviendront.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-pink-50">
            Commencez votre événement avec Invity et centralisez
            simplement toutes les réponses de vos invités.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-white px-7 py-4 font-semibold text-pink-600 transition hover:bg-pink-50"
            >
              Créer mon invitation
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-pink-300 px-7 py-4 font-semibold text-white transition hover:bg-pink-700"
            >
              J’ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-bold text-pink-600">
              Invity
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Créez. Invitez. Célébrez.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-gray-500">
            <Link
              href="/login"
              className="transition hover:text-pink-600"
            >
              Connexion
            </Link>

            <Link
              href="/register"
              className="transition hover:text-pink-600"
            >
              Créer un compte
            </Link>
          </div>

          <p className="text-sm text-gray-400">
            © 2026 Invity
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <article className="group rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        {description}
      </p>
    </article>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-gray-800 bg-gray-900 p-7">
      <div className="text-sm font-bold text-pink-400">
        {number}
      </div>

      <h3 className="mt-8 text-xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-gray-400">
        {description}
      </p>
    </article>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-700">
        ✓
      </div>

      <p className="font-medium text-gray-700">
        {text}
      </p>
    </div>
  );
}

function DashboardStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}