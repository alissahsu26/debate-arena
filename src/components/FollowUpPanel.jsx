import { useEffect, useRef, useState } from 'react';
import { useFollowUp } from '../context/FollowUpContext';
import { askFollowUp } from '../services/followUpChat';

let turnId = 0;

export default function FollowUpPanel() {
  const { isOpen, pendingSeed, closeFollowUp, clearPendingSeed } = useFollowUp();
  const [turns, setTurns] = useState([]);
  const [query, setQuery] = useState('');
  const listRef = useRef(null);

  async function submit(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id = ++turnId;
    setTurns((prev) => [...prev, { id, query: trimmed, status: 'pending' }]);
    try {
      const { answer, sources } = await askFollowUp({ query: trimmed });
      setTurns((prev) =>
        prev.map((t) => (t.id === id ? { ...t, answer, sources, status: 'done' } : t))
      );
    } catch (err) {
      setTurns((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: 'error', error: err.message } : t
        )
      );
    }
  }

  useEffect(() => {
    if (pendingSeed) {
      submit(pendingSeed);
      clearPendingSeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSeed]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns]);

  function handleSubmit(e) {
    e.preventDefault();
    submit(query);
    setQuery('');
  }

  return (
    <div className={`followup-panel ${isOpen ? 'open' : ''}`}>
      <div className="followup-panel-header">
        <p className="rpg-heading">Follow-up questions</p>
        <button
          type="button"
          className="followup-close-btn"
          onClick={closeFollowUp}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="followup-panel-list" ref={listRef}>
        {turns.length === 0 && (
          <p className="rpg-hint">Ask anything about the source material.</p>
        )}
        {turns.map((turn) => (
          <div className="followup-turn" key={turn.id}>
            <p className="followup-turn-query">{turn.query}</p>
            {turn.status === 'pending' && <p className="build-searching">Researching</p>}
            {turn.status === 'error' && (
              <p className="followup-turn-error">{turn.error}</p>
            )}
            {turn.status === 'done' && (
              <div className="followup-turn-answer">
                <p>{turn.answer}</p>
                {turn.sources.length > 0 && (
                  <div className="followup-turn-sources">
                    {turn.sources.map((source, i) => (
                      <details className="followup-source" key={source.id}>
                        <summary>[{i + 1}] similarity {source.similarity.toFixed(2)}</summary>
                        <p>{source.content}</p>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <form className="build-chat-row followup-panel-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="build-chat-input"
          placeholder="Ask a follow-up..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="rpg-suggest-btn build-chat-submit"
          disabled={!query.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
