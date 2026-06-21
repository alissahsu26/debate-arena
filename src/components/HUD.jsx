import {
  CHARACTERS,
  METRIC_KEYS,
  METRIC_LABELS,
  FINAL_CHOICES,
  HYBRID_MESSAGE,
  debateRounds,
  getOpponentChallenge,
  getOpponentCounter,
} from '../data/debateRounds';
import Onboarding from './Onboarding';
import BattleDialog from './BattleDialog';
import BuildYourCase from './BuildYourCase';
import EvidenceInventory from './EvidenceInventory';
import ThrowTimingBar from './ThrowTimingBar';

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

export default function HUD({
  state,
  round,
  onAdvance,
  onSelectSide,
  onSearchStart,
  onSearch,
  onMaterializeEvidence,
  onThrowCard,
  onLockPower,
  onFinalChoice,
}) {
  const {
    phase,
    playerSide,
    opponentSide,
    metrics,
    roundIndex,
    evidenceInventory,
    activeEvidence,
    inspectedEvidenceIds,
    exchangePhase,
    argumentCard,
    throwPowerLocked,
    throwPower,
    isSearching,
  } = state;

  const opponent = CHARACTERS[opponentSide];
  const player = CHARACTERS[playerSide];

  if (phase === 'onboarding') {
    return (
      <div className="hud-overlay">
        <MetricBars metrics={metrics} />
        <Onboarding onSelectSide={onSelectSide} />
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
          <p className="hud-text muted">Thanks for playing the debate arena.</p>
        </Panel>
      </div>
    );
  }

  if (phase === 'finalMessage') {
    return (
      <div className="hud-overlay">
        <MetricBars metrics={metrics} />
        <Panel title={`You chose: ${FINAL_CHOICES[state.finalChoice]}`}>
          <p className="hud-text muted">Thanks for playing the debate arena.</p>
        </Panel>
      </div>
    );
  }

  const challengeText =
    phase === 'counterAttack'
      ? getOpponentCounter(round, playerSide)
      : getOpponentChallenge(round, playerSide);

  return (
    <div className="hud-overlay">
      <MetricBars metrics={metrics} />

      <div className="round-badge">
        Round {roundIndex + 1} of {debateRounds.length}
        {exchangePhase === 'counter' && ' — Counter'}
      </div>

      {(phase === 'firstAttack' || phase === 'counterAttack') && (
        <BattleDialog
          speaker={opponent.label}
          text={challengeText}
          onContinue={onAdvance}
        />
      )}

      {phase === 'buildCase' && (
        <>
          <div className="hud-panel-build">
            <BuildYourCase
              round={round}
              roundIndex={roundIndex}
              playerSide={playerSide}
              exchangePhase={exchangePhase}
              evidenceInventory={evidenceInventory}
              inspectedEvidenceIds={inspectedEvidenceIds}
              onSearchStart={onSearchStart}
              onSearch={onSearch}
              onAdvance={onAdvance}
              isSearching={isSearching}
            />
          </div>
          <EvidenceInventory
            inventory={evidenceInventory}
            materializedIds={activeEvidence.map((e) => e.id)}
            inspectedIds={inspectedEvidenceIds}
            onMaterialize={onMaterializeEvidence}
          />
        </>
      )}

      {phase === 'launchArgument' && argumentCard && (
        <div className="hud-panel-launch">
          <Panel title="Launch Your Argument">
            <p className="hud-text argument-preview">"{argumentCard.text}"</p>
            <p className="hud-text muted">You are defending {player.side}.</p>
          </Panel>
          <ThrowTimingBar
            onLock={onLockPower}
            locked={throwPowerLocked}
            throwPower={throwPower}
          />
          {throwPowerLocked && (
            <button type="button" className="btn btn-primary throw-btn" onClick={onThrowCard}>
              Throw Argument!
            </button>
          )}
        </div>
      )}

      {phase === 'throwAnim' && (
        <div className="hud-panel-launch">
          <Panel title="Argument Incoming!">
            <p className="hud-text muted">Watch your argument fly toward {opponent.label}...</p>
          </Panel>
        </div>
      )}

      {phase === 'roundComplete' && (
        <div className="hud-panel-center">
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
        </div>
      )}
    </div>
  );
}
