import { useState, useEffect } from 'react';
import { searchEvidence } from '../services/evidenceSearch';
import { getSuggestedSearchPrompt } from '../data/debateRounds';

export default function BuildYourCase({
  round,
  roundIndex,
  playerSide,
  exchangePhase,
  evidenceInventory,
  inspectedEvidenceIds,
  onSearchStart,
  onSearch,
  onAdvance,
  isSearching,
}) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    setQuery('');
    setSelectedCategory(null);
  }, [roundIndex, exchangePhase]);

  const handleSuggestedClick = (category) => {
    setSelectedCategory(category);
    setQuery(getSuggestedSearchPrompt(roundIndex, playerSide, category, exchangePhase));
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    setSelectedCategory(null);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
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
  };

  const minMet = inspectedEvidenceIds.length >= 1;
  const suggested = round.suggestedSearches || [];

  return (
    <div className="build-your-case">
      <div className="god-prompt">
        <div className="god-prompt-icon">◈</div>
        <div className="god-prompt-text">
          <span className="god-prompt-label">Computer God</span>
          <p>Find evidence to support your position.</p>
        </div>
      </div>

      <div className="search-section">
        <p className="search-label">Suggested searches:</p>
        <div className="search-chips">
          {suggested.map((label) => (
            <button
              key={label}
              type="button"
              className={`search-chip ${selectedCategory === label ? 'selected' : ''}`}
              disabled={isSearching}
              onClick={() => handleSuggestedClick(label)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="search-input-row">
          <input
            type="text"
            className="search-input"
            placeholder="What evidence supports your position?"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isSearching}
          />
          <button
            type="button"
            className="btn btn-primary search-btn"
            disabled={isSearching || !query.trim()}
            onClick={handleSearch}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p className="hud-text muted search-hint">
          Each search adds one piece of evidence to your inventory below.
        </p>
      </div>

      <div className="build-actions">
        {minMet ? (
          <button type="button" className="btn btn-primary" onClick={onAdvance}>
            Launch Argument
          </button>
        ) : (
          <p className="hud-hint">
            Materialize evidence from your inventory, then inspect crystals in the arena.
          </p>
        )}
        {minMet && evidenceInventory.length > 1 && (
          <p className="hud-text muted">Optional: search and inspect more evidence for a stronger throw.</p>
        )}
      </div>
    </div>
  );
}
