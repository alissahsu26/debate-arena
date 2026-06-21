import {
  CHARACTERS,
  METRIC_KEYS,
  METRIC_LABELS,
  FINAL_CHOICES,
  HYBRID_MESSAGE,
  debateRounds,
} from '../data/debateRounds';

const METRIC_COLORS = {
  learning: '#4CAF50',
  equity: '#2196F3',
  scalability: '#FF9800',
  engagement: '#E91E63',
};

function MetricBars({ metrics }) {
  return (
    <div className="metric-bars">
      {METRIC_KEYS.map((key) => (
        <div key={key} className="metric-row">
          <span className="metric-label">{METRIC_LABELS[key]}</span>
          <div className="metric-track">
            <div
              className="metric-fill"
              style={{
                width: `${metrics[key]}%`,
                backgroundColor: METRIC_COLORS[key],
              }}
            />
          </div>
          <span className="metric-value">{metrics[key]}</span>
        </div>
      ))}
    </div>
  );
}

function Panel({ title, children, actions }) {
  return (
    <div className="hud-panel">
      {title && <h2 className="hud-title">{title}</h2>}
      <div className="hud-body">{children}</div>
      {actions && <div className="hud-actions">{actions}</div>}
    </div>
  );
}

export default function HUD({ state, dispatch, round, onAdvance, onFinalChoice, onThrowCard }) {
  const { phase, playerSide, opponentSide, metrics, inspectedEvidenceIds, roundIndex } = state;

  const opponent = CHARACTERS[opponentSide];
  const player = CHARACTERS[playerSide];
  const allEvidenceInspected = round.evidence.every((e) => inspectedEvidenceIds.includes(e.id));
  const hasArgumentCards = round.argumentCards?.length > 0;

  if (phase === 'selectSide') {
    return (
      <div className="hud-overlay">
        <MetricBars metrics={metrics} />
        <Panel title="Choose Your Side">
          <p className="hud-text">Pick a side — you'll face your opponent across the arena in first person.</p>
          <div className="side-buttons">
            <button
              type="button"
              className="btn btn-carnegie"
              onClick={() => dispatch({ type: 'SELECT_SIDE', side: 'carnegie' })}
            >
              {CHARACTERS.carnegie.label}
              <span className="btn-sub">{CHARACTERS.carnegie.side}</span>
            </button>
            <button
              type="button"
              className="btn btn-mastery"
              onClick={() => dispatch({ type: 'SELECT_SIDE', side: 'mastery' })}
            >
              {CHARACTERS.mastery.label}
              <span className="btn-sub">{CHARACTERS.mastery.side}</span>
            </button>
          </div>
        </Panel>
      </div>
    );
  }

  if (phase === 'finalChoice') {
    return (
      <div className="hud-overlay">
        <MetricBars metrics={metrics} />
        <Panel title="Debate Complete — Final Scores">
          <p className="hud-text">After debating, what model would you build?</p>
          <div className="side-buttons">
            <button type="button" className="btn btn-carnegie" onClick={() => onFinalChoice('carnegie')}>
              {FINAL_CHOICES.carnegie}
            </button>
            <button type="button" className="btn btn-mastery" onClick={() => onFinalChoice('mastery')}>
              {FINAL_CHOICES.mastery}
            </button>
            <button type="button" className="btn btn-hybrid" onClick={() => onFinalChoice('hybrid')}>
              {FINAL_CHOICES.hybrid}
            </button>
          </div>
        </Panel>
      </div>
    );
  }

  if (phase === 'hybridMessage') {
    return (
      <div className="hud-overlay">
        <MetricBars metrics={metrics} />
        <Panel title={`You chose: ${FINAL_CHOICES.hybrid}`}>
          <p className="hud-text hybrid-message">{HYBRID_MESSAGE}</p>
          <p className="hud-text muted">Thanks for playing the debate arena prototype.</p>
        </Panel>
      </div>
    );
  }

  if (phase === 'finalMessage') {
    return (
      <div className="hud-overlay">
        <MetricBars metrics={metrics} />
        <Panel title={`You chose: ${FINAL_CHOICES[state.finalChoice]}`}>
          <p className="hud-text muted">Thanks for playing the debate arena prototype.</p>
        </Panel>
      </div>
    );
  }

  const panelWrapperClass = ['evidence', 'argument', 'throwAnim'].includes(phase)
    ? 'hud-panel-side'
    : 'hud-panel-center';

  return (
    <div className="hud-overlay">
      <MetricBars metrics={metrics} />

      <div className="round-badge">
        Round {roundIndex + 1} of {debateRounds.length}
      </div>

      <div className={panelWrapperClass}>
      {phase === 'challenge' && (
        <Panel
          title={`${opponent.label} challenges:`}
          actions={
            <button type="button" className="btn btn-primary" onClick={onAdvance}>
              Enter the Arena
            </button>
          }
        >
          <p className="hud-text challenge-text">"{round.opponentChallenge}"</p>
          <p className="hud-text muted">You are defending {player.side}.</p>
        </Panel>
      )}

      {phase === 'evidence' && (
        <Panel
          title="Evidence Crystals Appeared"
          actions={
            allEvidenceInspected ? (
              <button type="button" className="btn btn-primary" onClick={onAdvance}>
                {hasArgumentCards ? 'Choose Your Argument' : 'Respond to Challenge'}
              </button>
            ) : (
              <p className="hud-hint">Click crystals in the arena to inspect evidence ({inspectedEvidenceIds.length}/{round.evidence.length})</p>
            )
          }
        >
          <ul className="evidence-list">
            {round.evidence.map((item) => {
              const inspected = inspectedEvidenceIds.includes(item.id);
              return (
                <li key={item.id} className={inspected ? 'evidence-item inspected' : 'evidence-item'}>
                  <span className="evidence-status">{inspected ? '✓' : '◇'}</span>
                  <span>{inspected ? item.text : 'Uninspected crystal — click in arena'}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      {phase === 'argument' && (
        <Panel
          title="Throw an Argument Card"
          actions={
            <>
              {round.argumentCards.map((card) => {
                const required = card.requiresEvidenceIds || round.evidence.map((e) => e.id);
                const unlocked = required.every((id) => inspectedEvidenceIds.includes(id));
                return unlocked ? (
                  <button
                    key={card.id}
                    type="button"
                    className="btn btn-primary"
                    onClick={() => onThrowCard(card)}
                  >
                    Throw: {card.text}
                  </button>
                ) : null;
              })}
              <p className="hud-hint">Or click the yellow card floating in the arena.</p>
            </>
          }
        >
          <p className="hud-text muted">
            Stronger arguments unlock after inspecting evidence. Cards stay locked until all evidence is reviewed.
          </p>
          {round.argumentCards.map((card) => {
            const required = card.requiresEvidenceIds || round.evidence.map((e) => e.id);
            const unlocked = required.every((id) => inspectedEvidenceIds.includes(id));
            return (
              <div key={card.id} className={`card-preview ${unlocked ? 'unlocked' : 'locked'}`}>
                {unlocked ? card.text : '🔒 Locked — inspect all evidence first'}
              </div>
            );
          })}
        </Panel>
      )}

      {phase === 'throwAnim' && (
        <Panel title="Argument Incoming!">
          <p className="hud-text muted">Watch your card fly toward the opponent...</p>
        </Panel>
      )}

      {phase === 'opponentCounter' && (
        <Panel
          title={`${opponent.label} responds:`}
          actions={
            <button type="button" className="btn btn-primary" onClick={onAdvance}>
              Choose Rebuttal
            </button>
          }
        >
          <p className="hud-text challenge-text">"{round.opponentCounter}"</p>
        </Panel>
      )}

      {phase === 'rebuttal' && (
        <Panel title="Choose Your Best Rebuttal">
          <p className="hud-hint rebuttal-hint">
            {allEvidenceInspected
              ? 'Full evidence bonus active — best rebuttal applies full impact.'
              : inspectedEvidenceIds.length > 0
                ? 'Partial evidence — best rebuttal applies 50% impact.'
                : 'No evidence inspected — rebuttal impact reduced to 0%.'}
          </p>
          <div className="rebuttal-buttons">
            {round.rebuttals.map((rb) => (
              <button
                key={rb.id}
                type="button"
                className="btn btn-rebuttal"
                onClick={() => dispatch({ type: 'SELECT_REBUTTAL', rebuttalId: rb.id })}
              >
                {rb.text}
              </button>
            ))}
          </div>
        </Panel>
      )}

      {phase === 'roundComplete' && (
        <Panel
          title={`Round ${roundIndex + 1} Complete`}
          actions={
            <button type="button" className="btn btn-primary" onClick={onAdvance}>
              {roundIndex + 1 >= debateRounds.length ? 'See Final Results' : 'Next Round'}
            </button>
          }
        >
          <p className="hud-text muted">Nice work! Review your metrics and continue.</p>
        </Panel>
      )}
      </div>
    </div>
  );
}
