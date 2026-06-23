import { reportRagFailure, reportRagSuccess } from './ragStatus';

const baseUrl = import.meta.env.VITE_EVIDENCE_API_URL;

/**
 * Fetch a dynamically generated, RAG-grounded onboarding quiz question.
 * @returns {Promise<{question: string, options: {id: string, label: string}[]}|null>}
 */
export async function fetchOnboardingQuestion({ side, questionNumber, priorAnswers }) {
  if (!baseUrl) {
    reportRagFailure();
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/onboarding-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ side, questionNumber, priorAnswers }),
    });
    if (!response.ok) {
      reportRagFailure();
      return null;
    }

    const data = await response.json();
    if (!data?.question || !Array.isArray(data.options)) {
      reportRagFailure();
      return null;
    }
    reportRagSuccess();
    return data;
  } catch {
    reportRagFailure();
    return null;
  }
}
