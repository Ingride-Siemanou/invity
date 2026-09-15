"use client";

import { useState } from "react";

type ResponseButtonsProps = {
  token: string;
  initialStatus: string;
};

type GuestStatus = "accepted" | "declined" | "maybe";

export default function ResponseButtons({
  token,
  initialStatus,
}: ResponseButtonsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendResponse(newStatus: GuestStatus) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/invitations/${token}/response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Impossible d’enregistrer votre réponse."
        );
        return;
      }

      setStatus(newStatus);
    } catch {
      setError("Impossible d’enregistrer votre réponse.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "accepted") {
    return (
      <div className="mt-10 rounded-2xl bg-green-50 p-6">
        <p className="text-lg font-semibold text-green-700">
          ✓ Vous avez confirmé votre présence.
        </p>

        <button
          type="button"
          onClick={() => setStatus("pending")}
          disabled={loading}
          className="mt-4 text-sm font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          Modifier ma réponse
        </button>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="mt-10 rounded-2xl bg-gray-50 p-6">
        <p className="text-lg font-semibold text-gray-700">
          ✕ Votre absence a bien été enregistrée.
        </p>

        <button
          type="button"
          onClick={() => setStatus("pending")}
          disabled={loading}
          className="mt-4 text-sm font-semibold text-pink-600 hover:text-pink-700 disabled:opacity-50"
        >
          Modifier ma réponse
        </button>
      </div>
    );
  }

  if (status === "maybe") {
    return (
      <div className="mt-10 rounded-2xl bg-yellow-50 p-6">
        <p className="text-lg font-semibold text-yellow-700">
          ? Vous avez indiqué que vous ne savez pas encore.
        </p>

        <button
          type="button"
          onClick={() => setStatus("pending")}
          disabled={loading}
          className="mt-4 text-sm font-semibold text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          Modifier ma réponse
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-gray-900">
        Serez-vous présent(e) ?
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Merci de nous indiquer votre réponse.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <button
          type="button"
          onClick={() => sendResponse("accepted")}
          disabled={loading}
          className="rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ✓ Je serai présent(e)
        </button>

        <button
          type="button"
          onClick={() => sendResponse("declined")}
          disabled={loading}
          className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ✕ Je ne pourrai pas venir
        </button>

        <button
          type="button"
          onClick={() => sendResponse("maybe")}
          disabled={loading}
          className="rounded-xl border border-yellow-200 bg-yellow-50 px-6 py-3 font-semibold text-yellow-700 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ? Je ne sais pas encore
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}