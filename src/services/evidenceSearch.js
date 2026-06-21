import { debateRounds, getEvidencePool } from '../data/debateRounds';

const USE_RAG_API = import.meta.env.VITE_EVIDENCE_API_URL != null;

/**
 * Hybrid evidence search — static pool now, RAG API when VITE_EVIDENCE_API_URL is set.
 * @returns {Promise<object[]>} matching evidence items (max 1 per search)
 */
export async function searchEvidence({
  query = '',
  category = null,
  roundIndex,
  playerSide,
  exchangePhase = 'attack',
  excludeIds = [],
}) {
  if (USE_RAG_API) {
    return fetchFromRagApi({ query, category, roundIndex, playerSide, exchangePhase });
  }

  return filterStaticPool({
    query,
    category,
    roundIndex,
    playerSide,
    exchangePhase,
    excludeIds,
  });
}

async function fetchFromRagApi({ query, category, roundIndex, playerSide, exchangePhase }) {
  const baseUrl = import.meta.env.VITE_EVIDENCE_API_URL;
  try {
    const response = await fetch(`${baseUrl}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, category, roundIndex, playerSide, exchangePhase }),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data.evidence) ? data.evidence.slice(0, 1) : [];
  } catch (err) {
    console.warn('RAG API unavailable, falling back to static pool:', err);
    return filterStaticPool({
      query,
      category,
      roundIndex,
      playerSide,
      exchangePhase,
      excludeIds: [],
    });
  }
}

function filterStaticPool({
  query,
  category,
  roundIndex,
  playerSide,
  exchangePhase,
  excludeIds,
}) {
  const round = debateRounds[roundIndex];
  if (!round) return [];

  const pool = getEvidencePool(round, exchangePhase);
  const normalizedQuery = query.toLowerCase().trim();
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  const scored = pool
    .filter((item) => item.sides.includes(playerSide))
    .filter((item) => !excludeIds.includes(item.id))
    .map((item) => {
      let score = 0;
      if (category && item.category === category) score += 10;
      terms.forEach((term) => {
        if (item.insight.toLowerCase().includes(term)) score += 3;
        if (item.keywords.some((k) => k.includes(term) || term.includes(k))) score += 5;
        if (item.category.toLowerCase().includes(term)) score += 4;
        if (item.label.toLowerCase().includes(term)) score += 2;
      });
      if (!category && !normalizedQuery) score += 1;
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    const fallback = pool
      .filter((item) => item.sides.includes(playerSide))
      .filter((item) => !excludeIds.includes(item.id))
      .slice(0, 1);
    return fallback;
  }

  return scored.slice(0, 1).map(({ item }) => item);
}
