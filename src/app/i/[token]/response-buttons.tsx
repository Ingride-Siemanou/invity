"use client";

import { useState } from "react";

type Question = {
  id: number;
  label: string;
  type: string;
  required: boolean;
  position: number;
  conditionQuestionId: number | null;
  conditionValue: string | null;
};

type ResponseButtonsProps = {
  token: string;
  initialStatus: string;
  maxCompanions: number;
  initialCompanionCount: number;
  childrenPolicy: string;
  minimumChildAge: number | null;
  initialChildrenCount: number;
  initialChildrenAges: string | null;
  questions: Question[];
};

type GuestStatus = "accepted" | "declined" | "maybe";

export default function ResponseButtons({
  token,
  initialStatus,
  maxCompanions,
  initialCompanionCount,
  childrenPolicy,
  minimumChildAge,
  initialChildrenCount,
  initialChildrenAges,
  questions,
}: ResponseButtonsProps) {
  const [status, setStatus] = useState(initialStatus);

  const [companionCount, setCompanionCount] = useState(
    initialCompanionCount
  );

  const [childrenCount, setChildrenCount] = useState(
    initialChildrenCount
  );

  const [childrenAges, setChildrenAges] = useState(
    initialChildrenAges ?? ""
  );

  const [hasChildren, setHasChildren] = useState<boolean | null>(
    initialChildrenCount > 0 ? true : null
  );

  const [showChildrenQuestion, setShowChildrenQuestion] =
    useState(false);

  const [showCompanionQuestion, setShowCompanionQuestion] =
    useState(false);

  const [answers, setAnswers] = useState<Record<number, string>>(
    {}
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const childrenAreAllowed =
    childrenPolicy === "allowed" ||
    childrenPolicy === "minimum_age";

  function isQuestionVisible(question: Question) {
    if (
      question.conditionQuestionId === null ||
      !question.conditionValue
    ) {
      return true;
    }

    const parentAnswer =
      answers[question.conditionQuestionId]?.trim() || "";

    return parentAnswer === question.conditionValue;
  }

  function updateAnswer(questionId: number, value: string) {
    setAnswers((currentAnswers) => {
      const newAnswers = {
        ...currentAnswers,
        [questionId]: value,
      };

      const clearHiddenChildren = (parentQuestionId: number) => {
        for (const question of questions) {
          if (
            question.conditionQuestionId !== parentQuestionId
          ) {
            continue;
          }

          const parentValue =
            newAnswers[parentQuestionId]?.trim() || "";

          if (parentValue !== question.conditionValue) {
            delete newAnswers[question.id];
            clearHiddenChildren(question.id);
          }
        }
      };

      clearHiddenChildren(questionId);

      return newAnswers;
    });

    setError("");
  }

  function validateRequiredQuestions() {
    for (const question of questions) {
      if (!isQuestionVisible(question)) {
        continue;
      }

      if (!question.required) {
        continue;
      }

      const value = answers[question.id]?.trim();

      if (!value) {
        setError(
          `Merci de répondre à la question : « ${question.label} »`
        );

        return false;
      }
    }

    return true;
  }

  function validateChildren() {
    if (!childrenAreAllowed) {
      return true;
    }

    if (hasChildren === null) {
      setError(
        "Merci d’indiquer si vous serez accompagné(e) d’un ou plusieurs enfants."
      );
      return false;
    }

    if (hasChildren === false) {
      return true;
    }

    if (
      !Number.isInteger(childrenCount) ||
      childrenCount < 1
    ) {
      setError(
        "Merci d’indiquer le nombre d’enfants présents."
      );
      return false;
    }

    if (!childrenAges.trim()) {
      setError("Merci d’indiquer l’âge des enfants.");
      return false;
    }

    return true;
  }

  async function sendResponse(
    newStatus: GuestStatus,
    companions = 0
  ) {
    if (!validateRequiredQuestions()) {
      return;
    }

    if (
      newStatus === "accepted" &&
      childrenAreAllowed &&
      !validateChildren()
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formattedAnswers = questions.map((question) => ({
        questionId: question.id,
        value: isQuestionVisible(question)
          ? answers[question.id]?.trim() || ""
          : "",
      }));

      const response = await fetch(
        `/api/invitations/${token}/response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            companionCount:
              newStatus === "accepted" ? companions : 0,

            hasChildren:
              newStatus === "accepted" &&
              childrenAreAllowed
                ? hasChildren
                : false,

            childrenCount:
              newStatus === "accepted" &&
              childrenAreAllowed &&
              hasChildren === true
                ? childrenCount
                : 0,

            childrenAges:
              newStatus === "accepted" &&
              childrenAreAllowed &&
              hasChildren === true
                ? childrenAges.trim()
                : "",

            answers: formattedAnswers,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Impossible d’enregistrer votre réponse."
        );

        return;
      }

      setStatus(newStatus);
      setCompanionCount(result.companionCount ?? 0);
      setChildrenCount(result.childrenCount ?? 0);
      setChildrenAges(result.childrenAges ?? "");

      if ((result.childrenCount ?? 0) > 0) {
        setHasChildren(true);
      } else if (newStatus === "accepted" && childrenAreAllowed) {
        setHasChildren(false);
      } else {
        setHasChildren(null);
      }

      setShowChildrenQuestion(false);
      setShowCompanionQuestion(false);
    } catch {
      setError("Impossible d’enregistrer votre réponse.");
    } finally {
      setLoading(false);
    }
  }

  function handleAccepted() {
    if (!validateRequiredQuestions()) {
      return;
    }

    if (childrenAreAllowed) {
      setError("");
      setShowCompanionQuestion(false);
      setShowChildrenQuestion(true);
      return;
    }

    if (maxCompanions > 0) {
      setError("");
      setShowChildrenQuestion(false);
      setShowCompanionQuestion(true);
      return;
    }

    sendResponse("accepted", 0);
  }

  function continueAfterChildren() {
    if (!validateChildren()) {
      return;
    }

    if (maxCompanions > 0) {
      setError("");
      setShowChildrenQuestion(false);
      setShowCompanionQuestion(true);
      return;
    }

    sendResponse("accepted", 0);
  }

  function modifyResponse() {
    setStatus("pending");
    setShowChildrenQuestion(false);
    setShowCompanionQuestion(false);

    if (childrenAreAllowed) {
      setHasChildren(
        childrenCount > 0 ? true : false
      );
    }

    setError("");
  }

  function renderQuestions() {
    const visibleQuestions = questions.filter(
      isQuestionVisible
    );

    if (visibleQuestions.length === 0) {
      return null;
    }

    return (
      <div className="mt-10 border-t border-gray-100 pt-8 text-left">
        <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
          Quelques questions
        </p>

        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Informations complémentaires
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Merci de répondre aux questions suivantes.
        </p>

        <div className="mt-6 space-y-6">
          {visibleQuestions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-2xl border border-gray-200 p-5"
            >
              <label
                htmlFor={`question-${question.id}`}
                className="block font-semibold text-gray-900"
              >
                <span className="mr-2 text-sm text-gray-400">
                  {index + 1}.
                </span>

                {question.label}

                {question.required && (
                  <span className="ml-1 text-pink-600">
                    *
                  </span>
                )}
              </label>

              {question.required && (
                <p className="mt-1 text-xs font-medium text-pink-600">
                  Réponse obligatoire
                </p>
              )}

              {question.type === "text" && (
                <input
                  id={`question-${question.id}`}
                  type="text"
                  value={answers[question.id] || ""}
                  onChange={(event) =>
                    updateAnswer(
                      question.id,
                      event.target.value
                    )
                  }
                  placeholder="Votre réponse"
                  className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
                />
              )}

              {question.type === "textarea" && (
                <textarea
                  id={`question-${question.id}`}
                  value={answers[question.id] || ""}
                  onChange={(event) =>
                    updateAnswer(
                      question.id,
                      event.target.value
                    )
                  }
                  placeholder="Votre réponse"
                  rows={4}
                  className="mt-4 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
                />
              )}

              {question.type === "number" && (
                <input
                  id={`question-${question.id}`}
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={answers[question.id] || ""}
                  onChange={(event) =>
                    updateAnswer(
                      question.id,
                      event.target.value
                    )
                  }
                  placeholder="0"
                  className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
                />
              )}

              {question.type === "yes_no" && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value="Oui"
                      checked={
                        answers[question.id] === "Oui"
                      }
                      onChange={() =>
                        updateAnswer(question.id, "Oui")
                      }
                    />

                    <span className="font-medium text-gray-700">
                      Oui
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value="Non"
                      checked={
                        answers[question.id] === "Non"
                      }
                      onChange={() =>
                        updateAnswer(question.id, "Non")
                      }
                    />

                    <span className="font-medium text-gray-700">
                      Non
                    </span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <>
        {renderQuestions()}

        <div className="mt-10 rounded-2xl bg-green-50 p-6">
          <p className="text-lg font-semibold text-green-700">
            ✓ Vous avez confirmé votre présence.
          </p>

          {childrenCount > 0 && (
            <div className="mt-3 text-sm text-green-700">
              <p>
                {childrenCount === 1
                  ? "Vous viendrez avec 1 enfant."
                  : `Vous viendrez avec ${childrenCount} enfants.`}
              </p>

              {childrenAges && (
                <p className="mt-1">
                  Âge{childrenCount > 1 ? "s" : ""} :{" "}
                  {childrenAges}
                </p>
              )}
            </div>
          )}

          {companionCount > 0 && (
            <p className="mt-3 text-sm text-green-700">
              {companionCount === 1
                ? "Vous viendrez avec 1 accompagnant."
                : `Vous viendrez avec ${companionCount} accompagnants.`}
            </p>
          )}

          <button
            type="button"
            onClick={modifyResponse}
            disabled={loading}
            className="mt-4 text-sm font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            Modifier ma réponse
          </button>
        </div>
      </>
    );
  }

  if (status === "declined") {
    return (
      <>
        {renderQuestions()}

        <div className="mt-10 rounded-2xl bg-gray-50 p-6">
          <p className="text-lg font-semibold text-gray-700">
            ✕ Votre absence a bien été enregistrée.
          </p>

          <button
            type="button"
            onClick={modifyResponse}
            disabled={loading}
            className="mt-4 text-sm font-semibold text-pink-600 hover:text-pink-700 disabled:opacity-50"
          >
            Modifier ma réponse
          </button>
        </div>
      </>
    );
  }

  if (status === "maybe") {
    return (
      <>
        {renderQuestions()}

        <div className="mt-10 rounded-2xl bg-yellow-50 p-6">
          <p className="text-lg font-semibold text-yellow-700">
            ? Vous avez indiqué que vous ne savez pas encore.
          </p>

          <button
            type="button"
            onClick={modifyResponse}
            disabled={loading}
            className="mt-4 text-sm font-semibold text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Modifier ma réponse
          </button>
        </div>
      </>
    );
  }

  if (showChildrenQuestion) {
    return (
      <>
        {renderQuestions()}

        <div className="mt-10 rounded-2xl border border-pink-100 bg-pink-50 p-6">
          <h2 className="text-xl font-bold text-gray-900">
            Serez-vous accompagné(e) d’un ou plusieurs enfants ?
          </h2>

          {childrenPolicy === "minimum_age" &&
            minimumChildAge !== null && (
              <p className="mt-2 text-sm font-medium text-gray-600">
                Les enfants sont invités à partir de{" "}
                {minimumChildAge} ans.
              </p>
            )}

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setHasChildren(true);

                if (childrenCount < 1) {
                  setChildrenCount(1);
                }

                setError("");
              }}
              disabled={loading}
              className={`rounded-xl border px-6 py-3 font-semibold transition ${
                hasChildren === true
                  ? "border-pink-600 bg-pink-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Oui
            </button>

            <button
              type="button"
              onClick={() => {
                setHasChildren(false);
                setChildrenCount(0);
                setChildrenAges("");
                setError("");
              }}
              disabled={loading}
              className={`rounded-xl border px-6 py-3 font-semibold transition ${
                hasChildren === false
                  ? "border-pink-600 bg-pink-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Non
            </button>
          </div>

          {hasChildren === true && (
            <div className="mx-auto mt-6 max-w-md space-y-5 text-left">
              <div>
                <label
                  htmlFor="childrenCount"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Combien d’enfants seront présents ?
                </label>

                <input
                  id="childrenCount"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={childrenCount}
                  onChange={(event) => {
                    setChildrenCount(
                      Number(event.target.value)
                    );
                    setError("");
                  }}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label
                  htmlFor="childrenAges"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Quel âge ont-ils ?
                </label>

                <input
                  id="childrenAges"
                  type="text"
                  value={childrenAges}
                  onChange={(event) => {
                    setChildrenAges(event.target.value);
                    setError("");
                  }}
                  placeholder="Ex. : 3 ans, 7 ans"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={continueAfterChildren}
              disabled={loading}
              className="rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {maxCompanions > 0
                ? "Continuer"
                : loading
                  ? "Enregistrement..."
                  : "Confirmer ma présence"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowChildrenQuestion(false);
                setError("");
              }}
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Retour
            </button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </>
    );
  }

  if (showCompanionQuestion) {
    return (
      <>
        {renderQuestions()}

        <div className="mt-10 rounded-2xl border border-pink-100 bg-pink-50 p-6">
          <h2 className="text-xl font-bold text-gray-900">
            Combien d’accompagnants viendront avec vous ?
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Vous pouvez venir avec{" "}
            {maxCompanions === 1
              ? "1 accompagnant maximum."
              : `${maxCompanions} accompagnants maximum.`}
          </p>

          <div className="mx-auto mt-6 max-w-xs">
            <label
              htmlFor="companionCount"
              className="block text-sm font-semibold text-gray-700"
            >
              Nombre d’accompagnants
            </label>

            <select
              id="companionCount"
              value={companionCount}
              onChange={(event) =>
                setCompanionCount(
                  Number(event.target.value)
                )
              }
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-pink-400"
            >
              {Array.from(
                { length: maxCompanions + 1 },
                (_, index) => (
                  <option key={index} value={index}>
                    {index}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                sendResponse(
                  "accepted",
                  companionCount
                )
              }
              disabled={loading}
              className="rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Enregistrement..."
                : "Confirmer ma présence"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowCompanionQuestion(false);

                if (childrenAreAllowed) {
                  setShowChildrenQuestion(true);
                }

                setError("");
              }}
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Retour
            </button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {renderQuestions()}

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
            onClick={handleAccepted}
            disabled={loading}
            className="rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✓ Je serai présent(e)
          </button>

          <button
            type="button"
            onClick={() =>
              sendResponse("declined", 0)
            }
            disabled={loading}
            className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕ Je ne pourrai pas venir
          </button>

          <button
            type="button"
            onClick={() =>
              sendResponse("maybe", 0)
            }
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
    </>
  );
}