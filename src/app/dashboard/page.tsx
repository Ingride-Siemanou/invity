import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/session";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("invity_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifySessionToken(token);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de bord
        </h1>

        <p className="mt-2 text-gray-600">
          Bienvenue {session.firstName} sur votre espace Invity.
        </p>
      </div>
    </main>
  );
}