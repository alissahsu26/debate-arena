import { useState, useEffect, useRef } from 'react';
import { searchEvidence } from '../services/evidenceSearch';
import { getSuggestedSearchPrompt } from '../data/debateRounds';
import { useFollowUp } from '../context/FollowUpContext';

export const MAX_EVIDENCE_SEARCHES = 3;

export default function BuildYourCase({
  round,
  roundIndex,
  playerSide,
  exchangePhase,
  evidenceInventory,
  onSearchStart,
  onSearch,
  onAdvance,
  isSearching,
  pendingEvidenceReveal,
}) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchHint, setSearchHint] = useState(null);
  const [lastSearchedQuery, setLastSearchedQuery] = useState(null);
  const inputRef = useRef(null);
  const { openFollowUp } = useFollowUp();

  useEffect(() => {
    setQuery('');
    setSelectedCategory(null);
    setSearchHint(null);
  }, [roundIndex, exchangePhase]);

  const handleSuggestedClick = (category) => {
    setSelectedCategory(category);
    setSearchHint(getSuggestedSearchPrompt(roundIndex, playerSide, category, exchangePhase));
    inputRef.current?.focus();
  };

  const handleSearch = async () => {
    if (!query.trim() || evidenceInventory.length >= MAX_EVIDENCE_SEARCHES) return;
    onSearchStart?.();
    const results = await searchEvidence({
      query,
      category: selectedCategory,
      roundIndex,
      playerSide,
      exchangePhase,
      excludeIds: evidenceInventory.map((e) => e.id),
    });
    onSearch(results);
    setLastSearchedQuery(query);
    setQuery('');
  };

  const searchesLeft = MAX_EVIDENCE_SEARCHES - evidenceInventory.length;
  const canSearch = searchesLeft > 0 && !pendingEvidenceReveal;
  const canReady = evidenceInventory.length >= 1 && !pendingEvidenceReveal;
  const suggested = round.suggestedSearches || [];

  return (
    <div className="build-your-case">
      <div className="rpg-box build-case-box">
        <p className="rpg-heading">Build your case</p>
        <p className="rpg-body">
          Search for evidence (up to {MAX_EVIDENCE_SEARCHES} times) to fill your inventory.
        </p>
        <p className="rpg-hint">
          {searchesLeft > 0
            ? `${searchesLeft} search${searchesLeft === 1 ? '' : 'es'} remaining.`
            : 'Inventory full — begin the fight when ready.'}
        </p>

        <div className="build-suggestions">
          {suggested.map((label) => (
            <button
              key={label}
              type="button"
              className={`rpg-suggest-btn ${selectedCategory === label ? 'selected' : ''}`}
              disabled={isSearching || !canSearch}
              onClick={() => handleSuggestedClick(label)}
            >
              {label}
            </button>
          ))}
        </div>

        {searchHint && (
          <p className="rpg-search-prompt">
            <span className="rpg-search-prompt-label">Try searching:</span> {searchHint}
          </p>
        )}

        <div className="build-chat-row">
          <input
            ref={inputRef}
            type="text"
            className="build-chat-input"
            placeholder="Type your search here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isSearching || !canSearch}
          />
          <button
            type="button"
            className="rpg-suggest-btn build-chat-submit"
            disabled={isSearching || !query.trim() || !canSearch}
            onClick={handleSearch}
          >
            {isSearching ? '...' : 'Search'}
          </button>
        </div>

        {isSearching && (
          <p className="build-searching">
            Researching evidence
            <span className="build-searching-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>
        )}

        {lastSearchedQuery && !isSearching && (
          <button
            type="button"
            className="rpg-suggest-btn followup-open-btn"
            onClick={() => openFollowUp(lastSearchedQuery)}
          >
            Ask a follow-up question ▸
          </button>
        )}

        {canReady ? (
          <button type="button" className="rpg-suggest-btn build-ready-btn" onClick={onAdvance}>
            Begin Fight ▶
          </button>
        ) : (
          <p className="rpg-hint">Search for evidence to add it to your inventory.</p>
        )}
      </div>
    </div>
  );
}
