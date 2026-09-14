"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (!response.ok) {
        return;
      }

      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );
}