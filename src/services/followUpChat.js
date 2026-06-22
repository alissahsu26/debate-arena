const baseUrl = import.meta.env.VITE_EVIDENCE_API_URL;

/**
 * Ask a grounded follow-up question against the RAG app's single-shot Q&A endpoint.
 * @returns {Promise<{answer: string, sources: object[]}>}
 */
export async function askFollowUp({ query }) {
  if (!baseUrl) {
    throw new Error('VITE_EVIDENCE_API_URL is not configured');
  }

  const response = await fetch(`${baseUrl}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `API error: ${response.status}`);
  }

  return { answer: data.answer, sources: data.sources ?? [] };
}
