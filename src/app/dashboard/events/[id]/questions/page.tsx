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
  conditionQuestionId: number | null;
  conditionValue: string | null;
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
  const [deletingQuestionId, setDeletingQuestionId] = useState<
    number | null
  >(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [conditionQuestionId, setConditionQuestionId] =
    useState("");
  const [conditionValue, setConditionValue] = useState("");

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
      conditionQuestionId: conditionQuestionId
        ? Number(conditionQuestionId)
        : null,
      conditionValue: conditionQuestionId
        ? conditionValue.trim()
        : null,
    };

    if (
      conditionQuestionId &&
      conditionValue.trim().length === 0
    ) {
      setError(
        "Indiquez la réponse qui doit déclencher cette question."
      );
      setLoading(false);
      return;
    }

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
      setConditionQuestionId("");
      setConditionValue("");
    } catch {
      setError(
        "Impossible d’ajouter la question pour le moment."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteQuestion(question: Question) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la question « ${question.label} » ?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingQuestionId(question.id);

    try {
      const response = await fetch(
        `/api/events/${id}/questions/${question.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Impossible de supprimer la question."
        );
        return;
      }

      setQuestions((currentQuestions) =>
        currentQuestions
          .filter((item) => item.id !== question.id)
          .map((item) =>
            item.conditionQuestionId === question.id
              ? {
                  ...item,
                  conditionQuestionId: null,
                  conditionValue: null,
                }
              : item
          )
      );

      if (
        conditionQuestionId === String(question.id)
      ) {
        setConditionQuestionId("");
        setConditionValue("");
      }

      setSuccess("Question supprimée avec succès !");
    } catch {
      setError(
        "Impossible de supprimer la question pour le moment."
      );
    } finally {
      setDeletingQuestionId(null);
    }
  }

  const selectedConditionQuestion = questions.find(
    (question) =>
      question.id === Number(conditionQuestionId)
  );

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
                placeholder="Ex. Précisez vos allergies alimentaires"
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

            {questions.length > 0 && (
              <div className="rounded-2xl border border-pink-100 bg-pink-50 p-5">
                <h3 className="font-semibold text-gray-900">
                  Affichage conditionnel
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  Vous pouvez afficher cette question seulement
                  après une réponse précise à une question
                  précédente.
                </p>

                <div className="mt-4">
                  <label
                    htmlFor="conditionQuestion"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Cette question dépend de
                  </label>

                  <select
                    id="conditionQuestion"
                    value={conditionQuestionId}
                    onChange={(event) => {
                      setConditionQuestionId(
                        event.target.value
                      );
                      setConditionValue("");
                    }}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
                  >
                    <option value="">
                      Aucune condition
                    </option>

                    {questions.map((question) => (
                      <option
                        key={question.id}
                        value={question.id}
                      >
                        {question.label}
                      </option>
                    ))}
                  </select>
                </div>

                {conditionQuestionId && (
                  <div className="mt-4">
                    <label
                      htmlFor="conditionValue"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Afficher si la réponse est
                    </label>

                    {selectedConditionQuestion?.type ===
                    "yes_no" ? (
                      <select
                        id="conditionValue"
                        value={conditionValue}
                        onChange={(event) =>
                          setConditionValue(
                            event.target.value
                          )
                        }
                        required
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
                      >
                        <option value="">
                          Choisir une réponse
                        </option>
                        <option value="Oui">Oui</option>
                        <option value="Non">Non</option>
                      </select>
                    ) : (
                      <input
                        id="conditionValue"
                        type="text"
                        value={conditionValue}
                        onChange={(event) =>
                          setConditionValue(
                            event.target.value
                          )
                        }
                        required
                        placeholder="Ex. Oui"
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
                      />
                    )}

                    <p className="mt-2 text-xs text-gray-500">
                      Exemple : « Précisez vos allergies »
                      s’affiche si « Avez-vous des allergies ? »
                      vaut « Oui ».
                    </p>
                  </div>
                )}
              </div>
            )}

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
              {questions.map((question, index) => {
                const parentQuestion = questions.find(
                  (item) =>
                    item.id ===
                    question.conditionQuestionId
                );

                return (
                  <div
                    key={question.id}
                    className="rounded-2xl border border-gray-100 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Question {index + 1}
                        </p>

                        <p className="mt-2 font-semibold text-gray-900">
                          {question.label}
                        </p>

                        {parentQuestion &&
                          question.conditionValue && (
                            <div className="mt-3 rounded-xl bg-pink-50 px-3 py-2 text-sm text-pink-700">
                              Affichée si «{" "}
                              {parentQuestion.label} » = «{" "}
                              {question.conditionValue} »
                            </div>
                          )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
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

                        {question.conditionQuestionId && (
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                            Conditionnelle
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteQuestion(question)
                          }
                          disabled={
                            deletingQuestionId === question.id
                          }
                          className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingQuestionId === question.id
                            ? "Suppression..."
                            : "Supprimer"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}