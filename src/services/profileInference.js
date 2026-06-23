import { reportRagFailure, reportRagSuccess } from './ragStatus';

const baseUrl = import.meta.env.VITE_EVIDENCE_API_URL;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * Infer a one-sentence player profile from their onboarding quiz answers.
 * @returns {Promise<string|null>} the inferred profile sentence, or null if unavailable
 */
export async function inferProfile({ side, answers }) {
  if (!baseUrl) {
    reportRagFailure();
    return null;
  }

  try {
    const response = await withTimeout(
      fetch(`${baseUrl}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ side, answers }),
      }),
      4000
    );
    if (!response || !response.ok) {
      reportRagFailure();
      return null;
    }

    const data = await response.json();
    reportRagSuccess();
    return data.profile ?? null;
  } catch {
    reportRagFailure();
    return null;
  }
}
