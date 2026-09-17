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
  if (type === "textarea") return "Réponse longue";
  if (type === "yes_no") return "Oui / Non";
  if (type === "number") return "Nombre";
  return "Réponse courte";
}

function getQuestionTypeIcon(type: string) {
  if (type === "textarea") return "☰";
  if (type === "yes_no") return "✓";
  if (type === "number") return "123";
  return "Aa";
}

export default function QuestionsPage() {
  const params = useParams();
  const id = params.id as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(
    null
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [conditionQuestionId, setConditionQuestionId] = useState("");
  const [conditionValue, setConditionValue] = useState("");

  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch(`/api/events/${id}/questions`);
        const result = await response.json();

        if (!response.ok) {
          setError(
            result.error || "Impossible de charger les questions."
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      const response = await fetch(`/api/events/${id}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Impossible d’ajouter la question."
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
          result.error || "Impossible de supprimer la question."
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

      if (conditionQuestionId === String(question.id)) {
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
    (question) => question.id === Number(conditionQuestionId)
  );

  const requiredQuestions = questions.filter(
    (question) => question.required
  ).length;

  const conditionalQuestions = questions.filter(
    (question) => question.conditionQuestionId !== null
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={`/dashboard/events/${id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-pink-600"
            >
              <span aria-hidden="true">←</span>
              Retour à l’événement
            </Link>

            <Link
              href={`/dashboard/events/${id}/guests`}
              className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700 sm:w-auto"
            >
              Voir les invités
            </Link>
          </div>
        </div>
      </div>

      <section className="bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-pink-300">
              Invity
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Questions personnalisées
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
              Demandez uniquement les informations dont vous avez besoin.
              Les réponses seront associées à chaque invité et visibles
              depuis votre espace organisateur.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <HeroStat
              value={questions.length}
              label={
                questions.length > 1
                  ? "Questions créées"
                  : "Question créée"
              }
            />

            <HeroStat
              value={requiredQuestions}
              label={
                requiredQuestions > 1
                  ? "Questions obligatoires"
                  : "Question obligatoire"
              }
            />

            <HeroStat
              value={conditionalQuestions}
              label={
                conditionalQuestions > 1
                  ? "Questions conditionnelles"
                  : "Question conditionnelle"
              }
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {(error || success) && (
          <div className="mb-6 space-y-3">
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
              >
                {success}
              </div>
            )}
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <section className="lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-xl">
                    ✦
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-950">
                      Ajouter une question
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      Cette question apparaîtra sur l’invitation de vos
                      invités.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 p-5 sm:p-6"
              >
                <div>
                  <label
                    htmlFor="label"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Votre question
                  </label>

                  <input
                    id="label"
                    name="label"
                    type="text"
                    required
                    maxLength={300}
                    placeholder="Ex. Avez-vous des allergies ?"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Maximum 300 caractères.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="type"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Type de réponse
                  </label>

                  <select
                    id="type"
                    name="type"
                    defaultValue="text"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-50"
                  >
                    <option value="text">Réponse courte</option>
                    <option value="textarea">Réponse longue</option>
                    <option value="yes_no">Oui / Non</option>
                    <option value="number">Nombre</option>
                  </select>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-gray-200">
                  <input
                    name="required"
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 accent-pink-600"
                  />

                  <span>
                    <span className="block text-sm font-bold text-gray-900">
                      Réponse obligatoire
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-gray-500">
                      L’invité devra répondre à cette question avant de
                      pouvoir valider sa réponse à l’invitation.
                    </span>
                  </span>
                </label>

                {questions.length > 0 && (
                  <div className="rounded-2xl border border-pink-100 bg-pink-50/70 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm">
                        ↳
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          Affichage conditionnel
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-gray-600">
                          Affichez cette question uniquement lorsque
                          l’invité a donné une réponse précise à une autre
                          question.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <label
                        htmlFor="conditionQuestion"
                        className="text-sm font-semibold text-gray-800"
                      >
                        Cette question dépend de
                      </label>

                      <select
                        id="conditionQuestion"
                        value={conditionQuestionId}
                        onChange={(event) => {
                          setConditionQuestionId(event.target.value);
                          setConditionValue("");
                        }}
                        className="mt-2 w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                      >
                        <option value="">Aucune condition</option>

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
                          className="text-sm font-semibold text-gray-800"
                        >
                          Afficher si la réponse est
                        </label>

                        {selectedConditionQuestion?.type ===
                        "yes_no" ? (
                          <select
                            id="conditionValue"
                            value={conditionValue}
                            onChange={(event) =>
                              setConditionValue(event.target.value)
                            }
                            required
                            className="mt-2 w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
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
                              setConditionValue(event.target.value)
                            }
                            required
                            placeholder="Ex. Oui"
                            className="mt-2 w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
                          />
                        )}

                        <div className="mt-3 rounded-xl bg-white/80 px-3 py-3 text-xs leading-5 text-gray-600">
                          <strong className="text-gray-800">
                            Exemple :
                          </strong>{" "}
                          « Précisez vos allergies » peut s’afficher
                          uniquement si « Avez-vous des allergies ? »
                          vaut « Oui ».
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-pink-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Ajout en cours..." : "Ajouter la question"}
                </button>
              </form>
            </div>
          </section>

          <section className="min-w-0">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-950">
                    Questions de l’événement
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Elles apparaîtront dans cet ordre sur l’invitation.
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
                  {questions.length} question
                  {questions.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="p-4 sm:p-6">
                {loadingQuestions ? (
                  <div className="flex min-h-48 items-center justify-center rounded-2xl bg-gray-50 px-6 text-center">
                    <div>
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-pink-600" />
                      <p className="mt-4 text-sm font-medium text-gray-500">
                        Chargement des questions...
                      </p>
                    </div>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                    <div className="max-w-sm">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                        ?
                      </div>

                      <h3 className="mt-5 font-bold text-gray-900">
                        Aucune question personnalisée
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        Ajoutez votre première question avec le formulaire.
                        Vous pourrez ensuite créer des questions
                        conditionnelles.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => {
                      const parentQuestion = questions.find(
                        (item) =>
                          item.id === question.conditionQuestionId
                      );

                      return (
                        <article
                          key={question.id}
                          className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-sm"
                        >
                          <div className="p-4 sm:p-5">
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-xs font-bold text-white">
                                {getQuestionTypeIcon(question.type)}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                                      Question {index + 1}
                                    </p>

                                    <h3 className="mt-1.5 break-words text-sm font-bold leading-6 text-gray-950 sm:text-base">
                                      {question.label}
                                    </h3>
                                  </div>

                                  <div className="flex shrink-0 flex-wrap gap-2">
                                    <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-pink-700">
                                      {getQuestionTypeLabel(question.type)}
                                    </span>

                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-bold ${
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
                                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                                        Conditionnelle
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {parentQuestion &&
                                  question.conditionValue && (
                                    <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 px-3 py-3 text-xs leading-5 text-purple-800 sm:text-sm">
                                      <span className="font-bold">
                                        Affichée si :
                                      </span>{" "}
                                      « {parentQuestion.label} » = «{" "}
                                      {question.conditionValue} »
                                    </div>
                                  )}

                                <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="text-xs text-gray-400">
                                    Position {index + 1}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteQuestion(question)
                                    }
                                    disabled={
                                      deletingQuestionId === question.id
                                    }
                                    className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:border-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                  >
                                    {deletingQuestionId === question.id
                                      ? "Suppression..."
                                      : "Supprimer"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm shadow-sm">
                  💡
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    À propos des enfants
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-600 sm:text-sm">
                    Les informations concernant les enfants sont gérées
                    automatiquement selon les règles configurées pour
                    l’événement. Vous n’avez pas besoin de recréer ces
                    questions ici.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function HeroStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-gray-400 sm:text-sm">
        {label}
      </p>
    </div>
  );
}