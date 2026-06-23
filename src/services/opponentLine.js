import { reportRagFailure, reportRagSuccess } from './ragStatus';

const baseUrl = import.meta.env.VITE_EVIDENCE_API_URL;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * Generate a fresh, RAG-grounded opponent line from a static seed line, personalized
 * toward the player's profile.
 * @returns {Promise<string|null>} the generated line, or null if unavailable
 */
export async function fetchOpponentLine({ side, exchangePhase, baseLine, userProfile }) {
  if (!baseUrl) {
    reportRagFailure();
    return null;
  }

  try {
    const response = await withTimeout(
      fetch(`${baseUrl}/opponent-line`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ side, exchangePhase, baseLine, userProfile }),
      }),
      6000
    );
    if (!response || !response.ok) {
      reportRagFailure();
      return null;
    }

    const data = await response.json();
    reportRagSuccess();
    return data.line ?? null;
  } catch {
    reportRagFailure();
    return null;
  }
}
