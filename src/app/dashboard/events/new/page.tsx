import Link from "next/link";

export default function NewEventPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-pink-600 hover:text-pink-700"
          >
            ← Retour au tableau de bord
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Créer un événement
          </h1>

          <p className="mt-2 text-gray-600">
            Commencez par renseigner les informations principales de votre événement.
          </p>

          <form className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nom de l’événement
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="Mariage de Jean et Marie"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Date
              </label>

              <input
                id="date"
                name="date"
                type="date"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label
                htmlFor="time"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Heure
              </label>

              <input
                id="time"
                name="time"
                type="time"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Lieu
              </label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="Paris"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Ajoutez quelques détails sur votre événement..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-pink-600 py-3.5 font-semibold text-white transition hover:bg-pink-700"
            >
              Créer l’événement
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}