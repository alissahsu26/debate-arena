import { reportRagFailure, reportRagSuccess } from './ragStatus';

const baseUrl = import.meta.env.VITE_EVIDENCE_API_URL;

/**
 * Fetch a RAG-grounded suggested search question for a category.
 * @returns {Promise<string|null>} the hint, or null if unavailable
 */
export async function fetchSearchHint({ side, category, exchangePhase, topicSeed, userProfile }) {
  if (!baseUrl) {
    reportRagFailure();
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/search-hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ side, category, exchangePhase, topicSeed, userProfile }),
    });
    if (!response.ok) {
      reportRagFailure();
      return null;
    }

    const data = await response.json();
    reportRagSuccess();
    return data.hint ?? null;
  } catch {
    reportRagFailure();
    return null;
  }
}
