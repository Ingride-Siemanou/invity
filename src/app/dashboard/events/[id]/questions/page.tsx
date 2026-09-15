"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Question = {
  id: number;
  label: string;
  type: string;
  required: boolean;
  position: number;
};

function getQuestionTypeLabel(type: string) {
  if (type === "textarea") {
    return "Réponse longue";
  }

  if (type === "yes_no") {
    return "Oui / Non";
  }

  return "Réponse courte";
}

export default function QuestionsPage() {
  const params = useParams();
  const id = params.id as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch(
          `/api/events/${id}/questions`
        );

        const result = await response.json();

        if (!response.ok) {
          setError(
            result.error ||
              "Impossible de charger les questions."
          );
          return;
        }

        setQuestions(result.questions);
      } catch {
        setError(
          "Impossible de charger les questions pour le moment."
        );
      } finally {
        setLoadingQuestions(false);
      }
    }

    loadQuestions();
  }, [id]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form = event.currentTarget;

    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(form);

    const data = {
      label: formData.get("label"),
      type: formData.get("type"),
      required: formData.get("required") === "on",
    };

    try {
      const response = await fetch(
        `/api/events/${id}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Impossible d’ajouter la question."
        );
        return;
      }

      setQuestions((currentQuestions) => [
        ...currentQuestions,
        result.question,
      ]);

      setSuccess("Question ajoutée avec succès !");
      form.reset();
    } catch {
      setError(
        "Impossible d’ajouter la question pour le moment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/dashboard/events/${id}`}
          className="text-sm font-medium text-pink-600 hover:text-pink-700"
        >
          ← Retour à l’événement
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
            Invity
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Questions personnalisées
          </h1>

          <p className="mt-2 max-w-2xl text-gray-500">
            Ajoutez les informations que vous souhaitez demander
            à vos invités lorsqu’ils répondent à leur invitation.
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Ajouter une question
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6"
          >
            <div>
              <label
                htmlFor="label"
                className="text-sm font-semibold text-gray-700"
              >
                Question
              </label>

              <input
                id="label"
                name="label"
                type="text"
                required
                maxLength={300}
                placeholder="Ex. Avez-vous des allergies alimentaires ?"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
              />

              <p className="mt-2 text-xs text-gray-400">
                Maximum 300 caractères.
              </p>
            </div>

            <div>
              <label
                htmlFor="type"
                className="text-sm font-semibold text-gray-700"
              >
                Type de réponse
              </label>

              <select
                id="type"
                name="type"
                defaultValue="text"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
              >
                <option value="text">
                  Réponse courte
                </option>

                <option value="textarea">
                  Réponse longue
                </option>

                <option value="yes_no">
                  Oui / Non
                </option>
              </select>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-gray-50 p-4">
              <input
                name="required"
                type="checkbox"
                className="mt-1 h-4 w-4"
              />

              <span>
                <span className="block font-semibold text-gray-900">
                  Réponse obligatoire
                </span>

                <span className="mt-1 block text-sm text-gray-500">
                  L’invité devra répondre à cette question
                  avant de pouvoir envoyer sa réponse.
                </span>
              </span>
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-pink-600 py-3.5 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Ajout..."
                : "Ajouter la question"}
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              Questions de l’événement
            </h2>

            <span className="text-sm text-gray-500">
              {questions.length} question
              {questions.length > 1 ? "s" : ""}
            </span>
          </div>

          {loadingQuestions ? (
            <p className="mt-6 text-gray-500">
              Chargement des questions...
            </p>
          ) : questions.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-gray-50 p-6">
              <p className="font-medium text-gray-700">
                Aucune question personnalisée.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Utilisez le formulaire ci-dessus pour créer
                votre première question.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-2xl border border-gray-100 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Question {index + 1}
                      </p>

                      <p className="mt-2 font-semibold text-gray-900">
                        {question.label}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">
                        {getQuestionTypeLabel(
                          question.type
                        )}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          question.required
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {question.required
                          ? "Obligatoire"
                          : "Facultative"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}