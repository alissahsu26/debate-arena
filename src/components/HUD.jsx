import {
  CHARACTERS,
  HYBRID_MESSAGE,
  debateRounds,
  getOpponentChallenge,
  getOpponentCounter,
} from '../data/debateRounds';
import { CATEGORY_COLORS } from '../data/crystalStyles';
import { determineDebateOutcome } from '../services/audienceMeter';
import Onboarding from './Onboarding';
import BattleDialog from './BattleDialog';
import BuildYourCase from './BuildYourCase';
import BattleStage from './BattleStage';
import EvidenceInventory from './EvidenceInventory';
import EvidenceFound from './EvidenceFound';
import EvidenceQuiz from './EvidenceQuiz';
import ThrowTimingBar from './ThrowTimingBar';
import AudienceMeter from './AudienceMeter';

function Panel({ title, children, actions }) {
  return (
    <div className="rpg-box hud-rpg-panel">
      {title && <h2 className="rpg-heading">{title}</h2>}
      <div className="hud-rpg-body">{children}</div>
      {actions && <div className="hud-rpg-actions">{actions}</div>}
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
  onDismissEvidenceReveal,
  onAnswerQuiz,
  onDismissQuiz,
  onThrowCrystals,
  onLockPower,
}) {
  const {
    phase,
    playerSide,
    opponentSide,
    audienceScore,
    roundIndex,
    evidenceInventory,
    activeEvidence,
    inspectedEvidenceIds,
    exchangePhase,
    launchPayload,
    throwPowerLocked,
    throwPower,
    isSearching,
    pendingEvidenceReveal,
    activeQuiz,
    quizAnswered,
    failedEvidenceIds,
  } = state;

  const opponent = CHARACTERS[opponentSide];

  if (phase === 'onboarding') {
    return (
      <div className="hud-overlay hud-overlay--onboarding">
        <Onboarding onSelectSide={onSelectSide} />
      </div>
    );
  }

  if (phase === 'debateResult') {
    const outcome = determineDebateOutcome(audienceScore);

    return (
      <div className="hud-overlay">
        <div className="audience-meter-wrap audience-meter-wrap--centered">
          <AudienceMeter score={audienceScore} />
        </div>
        <Panel title={outcome.label}>
          <p className="rpg-body">{outcome.description}</p>
          {outcome.recommended === 'hybrid' && (
            <p className="rpg-body hybrid-message">{HYBRID_MESSAGE}</p>
          )}
          <p className="rpg-hint">Thanks for playing the debate arena.</p>
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
      <div className="audience-meter-wrap">
        <AudienceMeter score={audienceScore} />
      </div>

      <div className="round-badge">
        Round {roundIndex + 1} of {debateRounds.length}
        {exchangePhase === 'counter' && ' — Counter'}
      </div>

      {phase === 'firstAttack' && (
        <BattleDialog
          speaker={opponent.label}
          text={challengeText}
          subtitle="Opening challenge"
          onContinue={onAdvance}
        />
      )}

      {phase === 'counterAttack' && (
        <BattleDialog
          speaker={opponent.label}
          text={challengeText}
          subtitle="Opponent counterargument — press continue to see the audience react"
          onContinue={onAdvance}
        />
      )}

      {phase === 'buildCase' && (
        <>
          <BuildYourCase
            round={round}
            roundIndex={roundIndex}
            playerSide={playerSide}
            exchangePhase={exchangePhase}
            evidenceInventory={evidenceInventory}
            onSearchStart={onSearchStart}
            onSearch={onSearch}
            onAdvance={onAdvance}
            isSearching={isSearching}
            pendingEvidenceReveal={pendingEvidenceReveal}
          />
          {pendingEvidenceReveal && (
            <EvidenceFound
              evidence={pendingEvidenceReveal}
              searchNumber={evidenceInventory.length}
              maxSearches={3}
              onDismiss={onDismissEvidenceReveal}
            />
          )}
          <EvidenceInventory
            inventory={evidenceInventory}
            materializedIds={[]}
            inspectedIds={[]}
            onMaterialize={onMaterializeEvidence}
            canMaterialize={false}
          />
        </>
      )}

      {phase === 'battle' && (
        <>
          <BattleStage
            inspectedCount={inspectedEvidenceIds.length}
            inventoryCount={evidenceInventory.length}
            activeQuiz={activeQuiz}
            onAdvance={onAdvance}
          />
          {activeQuiz && (
            <EvidenceQuiz
              quiz={activeQuiz}
              evidenceLabel={
                evidenceInventory.find((e) => e.id === activeQuiz.evidenceId)?.label
              }
              crystalCategory={
                evidenceInventory.find((e) => e.id === activeQuiz.evidenceId)?.category
              }
              answered={quizAnswered}
              onAnswer={(optionId) => onAnswerQuiz(activeQuiz.evidenceId, optionId)}
              onDismiss={onDismissQuiz}
            />
          )}
          <EvidenceInventory
            inventory={evidenceInventory}
            materializedIds={activeEvidence.map((e) => e.id)}
            inspectedIds={inspectedEvidenceIds}
            failedIds={failedEvidenceIds}
            onMaterialize={onMaterializeEvidence}
            canMaterialize
            quizLocked={Boolean(activeQuiz)}
          />
        </>
      )}

      {phase === 'launchCrystals' && launchPayload && (
        <div className="hud-panel-launch">
          <Panel title="Launch Attack">
            <ul className="crystal-launch-list">
              {(launchPayload.crystals || []).map((crystal) => (
                <li
                  key={crystal.id}
                  className="crystal-launch-item"
                  style={{ '--crystal-color': CATEGORY_COLORS[crystal.category] || '#58D8F8' }}
                >
                  <div className="crystal-launch-row">
                    <span className="crystal-launch-gem" aria-hidden="true">
                      <span className="crystal-launch-shine" />
                    </span>
                    <div className="crystal-launch-copy">
                      <span className="crystal-launch-label">{crystal.label}</span>
                      <span className="crystal-launch-insight">{crystal.insight}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="rpg-hint">
              Persuade the audience — aim, lock power, and launch toward {opponent.label}.
            </p>
          </Panel>
          <ThrowTimingBar
            onLock={onLockPower}
            locked={throwPowerLocked}
            throwPower={throwPower}
          />
          {throwPowerLocked && (
            <button type="button" className="rpg-suggest-btn rpg-action-btn throw-btn" onClick={onThrowCrystals}>
              Launch Attack!
            </button>
          )}
        </div>
      )}

      {phase === 'throwAnim' && (
        <div className="hud-panel-launch">
          <Panel title="Crystals Incoming!">
            <p className="rpg-hint">
              Your evidence is flying — watch the audience meter after impact.
            </p>
          </Panel>
        </div>
      )}

      {phase === 'roundComplete' && (
        <div className="hud-panel-center">
          <Panel
            title={`Round ${roundIndex + 1} Complete`}
            actions={
              <button type="button" className="rpg-suggest-btn rpg-action-btn" onClick={onAdvance}>
                {roundIndex + 1 >= debateRounds.length ? 'See Final Results' : 'Next Round'}
              </button>
            }
          >
            <p className="rpg-hint">
              The audience is leaning{' '}
              {audienceScore > 5
                ? 'toward Mastery Learning'
                : audienceScore < -5
                  ? 'toward Carnegie Units'
                  : 'toward the center'}
              . Continue to the next round.
            </p>
          </Panel>
        </div>
      )}
    </div>
  );
}
