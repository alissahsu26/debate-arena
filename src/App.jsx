import { useReducer, useCallback, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Arena from './components/Arena';
import HUD from './components/HUD';
import FollowUpPanel from './components/FollowUpPanel';
import FollowUpTab from './components/FollowUpTab';
import { FollowUpProvider } from './context/FollowUpContext';
import { INITIAL_AUDIENCE_SCORE, debateRounds } from './data/debateRounds';
import { buildLaunchPayload, getEvidenceMultiplier } from './services/argumentBuilder';
import { getEvidenceQuiz } from './services/evidenceQuiz';
import {
  clampAudienceScore,
  computeLaunchAudienceShift,
  formatAudienceShiftText,
  getOpponentCounterShift,
  isShiftFavorable,
} from './services/audienceMeter';
import './index.css';

let audienceTextId = 0;

function createAudienceText(delta, playerSide) {
  return {
    id: ++audienceTextId,
    text: formatAudienceShiftText(delta),
    positive: isShiftFavorable(delta, playerSide),
  };
}

function applyAudienceShift(state, delta) {
  return {
    audienceScore: clampAudienceScore(state.audienceScore + delta),
    combatTexts: [...state.combatTexts, createAudienceText(delta, state.playerSide)],
  };
}

const initialState = {
  phase: 'onboarding',
  roundIndex: 0,
  playerSide: null,
  opponentSide: null,
  exchangePhase: 'attack',
  audienceScore: INITIAL_AUDIENCE_SCORE,
  evidenceInventory: [],
  activeEvidence: [],
  inspectedEvidenceIds: [],
  launchPayload: null,
  combatTexts: [],
  isThrowingCrystals: false,
  throwPower: 1,
  throwAim: { x: 0, y: 0 },
  throwPowerLocked: false,
  isSearching: false,
  pendingEvidenceReveal: null,
  activeQuiz: null,
  quizAnswered: null,
  failedEvidenceIds: [],
  explodingEvidenceId: null,
};

function resetExchangeState(state) {
  return {
    evidenceInventory: [],
    activeEvidence: [],
    inspectedEvidenceIds: [],
    launchPayload: null,
    throwPower: 1,
    throwAim: { x: 0, y: 0 },
    throwPowerLocked: false,
    isThrowingCrystals: false,
    pendingEvidenceReveal: null,
    activeQuiz: null,
    quizAnswered: null,
    failedEvidenceIds: [],
    explodingEvidenceId: null,
  };
}

function hasUsableEvidence(state) {
  return state.evidenceInventory.some(
    (item) =>
      !state.inspectedEvidenceIds.includes(item.id) &&
      !state.failedEvidenceIds.includes(item.id) &&
      !state.activeEvidence.some((evidence) => evidence.id === item.id)
  );
}

function shouldSkipToOpponentTurn(state) {
  if (state.phase !== 'battle') return false;
  if (state.activeQuiz || state.explodingEvidenceId) return false;
  if (state.inspectedEvidenceIds.length > 0) return false;
  return !hasUsableEvidence(state);
}

function buildOpponentTurnState(state) {
  const nextPhase = state.exchangePhase === 'attack' ? 'counterAttack' : 'roundComplete';
  return {
    ...state,
    phase: nextPhase,
    activeEvidence: [],
    activeQuiz: null,
    quizAnswered: null,
    explodingEvidenceId: null,
  };
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'PLAY_AGAIN':
      return { ...initialState };

    case 'SKIP_TO_END': {
      const playerSide = state.playerSide ?? 'mastery';
      const opponentSide = playerSide === 'carnegie' ? 'mastery' : 'carnegie';
      return {
        ...state,
        playerSide,
        opponentSide,
        phase: 'debateResult',
        roundIndex: debateRounds.length - 1,
        isThrowingCrystals: false,
        isSearching: false,
        activeQuiz: null,
        pendingEvidenceReveal: null,
        explodingEvidenceId: null,
        launchPayload: null,
      };
    }

    case 'SELECT_SIDE': {
      const playerSide = action.side;
      const opponentSide = playerSide === 'carnegie' ? 'mastery' : 'carnegie';
      return {
        ...state,
        playerSide,
        opponentSide,
        phase: 'firstAttack',
        audienceScore: INITIAL_AUDIENCE_SCORE,
        ...resetExchangeState(state),
        exchangePhase: 'attack',
      };
    }

    case 'ADVANCE_PHASE': {
      const transitions = {
        firstAttack: 'buildCase',
        buildCase: 'battle',
        battle: 'launchCrystals',
        counterAttack: 'buildCase',
        roundComplete:
          state.roundIndex + 1 >= debateRounds.length ? 'debateResult' : 'firstAttack',
      };

      const nextPhase = transitions[state.phase];
      if (!nextPhase) return state;

      if (state.phase === 'buildCase' && nextPhase === 'battle') {
        return {
          ...state,
          phase: 'battle',
          activeEvidence: [],
          inspectedEvidenceIds: [],
          pendingEvidenceReveal: null,
          activeQuiz: null,
          quizAnswered: null,
          failedEvidenceIds: [],
          explodingEvidenceId: null,
        };
      }

      if (state.phase === 'battle' && nextPhase === 'launchCrystals') {
        const inspected = state.activeEvidence.filter((e) =>
          state.inspectedEvidenceIds.includes(e.id)
        );
        const launchPayload = buildLaunchPayload(inspected);
        return {
          ...state,
          phase: 'launchCrystals',
          launchPayload,
          throwPowerLocked: false,
          throwPower: 1,
          throwAim: { x: 0, y: 0 },
        };
      }

      if (state.phase === 'counterAttack' && nextPhase === 'buildCase') {
        const round = debateRounds[state.roundIndex];
        const { delta } = getOpponentCounterShift(round, state.opponentSide);
        const audienceUpdate = applyAudienceShift(state, delta);

        return {
          ...state,
          phase: 'buildCase',
          exchangePhase: 'counter',
          audienceScore: audienceUpdate.audienceScore,
          combatTexts: audienceUpdate.combatTexts,
          ...resetExchangeState(state),
        };
      }

      if (state.phase === 'roundComplete' && nextPhase === 'firstAttack') {
        return {
          ...state,
          phase: 'firstAttack',
          roundIndex: state.roundIndex + 1,
          exchangePhase: 'attack',
          ...resetExchangeState(state),
        };
      }

      return { ...state, phase: nextPhase };
    }

    case 'SEARCH_EVIDENCE': {
      const newItems = action.results
        .filter((item) => !state.evidenceInventory.some((e) => e.id === item.id))
        .slice(0, 1);
      const found = newItems[0] ?? null;
      return {
        ...state,
        evidenceInventory: [...state.evidenceInventory, ...newItems],
        isSearching: false,
        pendingEvidenceReveal: found,
      };
    }

    case 'DISMISS_EVIDENCE_REVEAL': {
      return { ...state, pendingEvidenceReveal: null };
    }

    case 'MATERIALIZE_EVIDENCE': {
      if (state.activeQuiz) return state;
      if (
        state.inspectedEvidenceIds.includes(action.id) ||
        state.failedEvidenceIds.includes(action.id)
      ) {
        return state;
      }
      if (state.activeEvidence.some((e) => e.id === action.id)) return state;
      const evidence = state.evidenceInventory.find((e) => e.id === action.id);
      if (!evidence) return state;

      const quiz = getEvidenceQuiz(evidence, {
        round: debateRounds[state.roundIndex],
        playerSide: state.playerSide,
        exchangePhase: state.exchangePhase,
      });

      return {
        ...state,
        activeEvidence: [...state.activeEvidence, evidence],
        activeQuiz: { evidenceId: action.id, ...quiz },
        quizAnswered: null,
      };
    }

    case 'ANSWER_QUIZ': {
      const { evidenceId, optionId } = action;
      if (!state.activeQuiz || state.activeQuiz.evidenceId !== evidenceId) return state;

      const selected = state.activeQuiz.options.find((o) => o.id === optionId);
      const correct = Boolean(selected?.correct);

      if (correct) {
        return {
          ...state,
          inspectedEvidenceIds: [...state.inspectedEvidenceIds, evidenceId],
          quizAnswered: { correct: true, selectedId: optionId },
        };
      }

      return {
        ...state,
        failedEvidenceIds: [...state.failedEvidenceIds, evidenceId],
        explodingEvidenceId: evidenceId,
        quizAnswered: { correct: false, selectedId: optionId },
      };
    }

    case 'DISMISS_QUIZ': {
      const nextState = {
        ...state,
        activeQuiz: null,
        quizAnswered: null,
      };
      return shouldSkipToOpponentTurn(nextState)
        ? buildOpponentTurnState(nextState)
        : nextState;
    }

    case 'EXPLOSION_COMPLETE': {
      const nextState = {
        ...state,
        activeEvidence: state.activeEvidence.filter((e) => e.id !== action.id),
        explodingEvidenceId: null,
      };
      return shouldSkipToOpponentTurn(nextState)
        ? buildOpponentTurnState(nextState)
        : nextState;
    }

    case 'SET_SEARCHING': {
      return { ...state, isSearching: action.value };
    }

    case 'SET_THROW_AIM': {
      return { ...state, throwAim: action.aim };
    }

    case 'LOCK_THROW_POWER': {
      return {
        ...state,
        throwPower: action.power,
        throwPowerLocked: true,
      };
    }

    case 'THROW_CRYSTALS': {
      if (!state.throwPowerLocked) return state;
      return {
        ...state,
        phase: 'throwAnim',
        isThrowingCrystals: true,
        throwPower: action.power ?? state.throwPower,
        throwAim: action.aim ?? state.throwAim,
      };
    }

    case 'THROW_COMPLETE': {
      const payload = state.launchPayload;

      if (!payload?.crystals?.length) {
        const nextPhase = state.exchangePhase === 'attack' ? 'counterAttack' : 'roundComplete';
        return {
          ...state,
          phase: nextPhase,
          isThrowingCrystals: false,
        };
      }

      const evidenceMultiplier = getEvidenceMultiplier(state.inspectedEvidenceIds.length);
      const delta = computeLaunchAudienceShift(
        payload.crystals,
        state.playerSide,
        evidenceMultiplier,
        state.throwPower
      );
      const audienceUpdate = applyAudienceShift(state, delta);

      const nextPhase = state.exchangePhase === 'attack' ? 'counterAttack' : 'roundComplete';

      return {
        ...state,
        audienceScore: audienceUpdate.audienceScore,
        combatTexts: audienceUpdate.combatTexts,
        phase: nextPhase,
        isThrowingCrystals: false,
        throwPowerLocked: false,
        launchPayload: null,
        activeEvidence: [],
      };
    }

    case 'REMOVE_COMBAT_TEXT': {
      return {
        ...state,
        combatTexts: state.combatTexts.filter((t) => t.id !== action.id),
      };
    }

    default:
      return state;
  }
}

function CombatTextLayer({ texts, onRemove }) {
  return (
    <div className="combat-text-layer">
      {texts.map((item, index) => (
        <CombatText key={item.id} item={item} index={index} onRemove={onRemove} />
      ))}
    </div>
  );
}

function CombatText({ item, index, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(item.id), 2000);
    return () => clearTimeout(timer);
  }, [item.id, onRemove]);

  return (
    <div
      className={`combat-text audience-float ${item.positive ? 'positive' : 'negative'}`}
      style={{
        left: `${50 + (index % 3 - 1) * 12}%`,
        top: `${42 + Math.floor(index / 3) * 10}%`,
      }}
    >
      {item.text}
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const round = debateRounds[state.roundIndex];

  const handleAdvance = useCallback(() => {
    dispatch({ type: 'ADVANCE_PHASE' });
  }, []);

  const handleSelectSide = useCallback((side) => {
    dispatch({ type: 'SELECT_SIDE', side });
  }, []);

  const handlePlayAgain = useCallback(() => {
    dispatch({ type: 'PLAY_AGAIN' });
  }, []);

  const handleSkipToEnd = useCallback(() => {
    dispatch({ type: 'SKIP_TO_END' });
  }, []);

  const handleDismissEvidenceReveal = useCallback(() => {
    dispatch({ type: 'DISMISS_EVIDENCE_REVEAL' });
  }, []);

  const handleAnswerQuiz = useCallback((evidenceId, optionId) => {
    dispatch({ type: 'ANSWER_QUIZ', evidenceId, optionId });
  }, []);

  const handleDismissQuiz = useCallback(() => {
    dispatch({ type: 'DISMISS_QUIZ' });
  }, []);

  const handleExplosionComplete = useCallback((id) => {
    dispatch({ type: 'EXPLOSION_COMPLETE', id });
  }, []);

  const handleSearchStart = useCallback(() => {
    dispatch({ type: 'SET_SEARCHING', value: true });
  }, []);

  const handleSearch = useCallback((results) => {
    dispatch({ type: 'SEARCH_EVIDENCE', results });
  }, []);

  const handleMaterializeEvidence = useCallback((id) => {
    dispatch({ type: 'MATERIALIZE_EVIDENCE', id });
  }, []);

  const handleLockPower = useCallback((power) => {
    dispatch({ type: 'LOCK_THROW_POWER', power });
  }, []);

  const handleThrowCrystals = useCallback(() => {
    dispatch({ type: 'THROW_CRYSTALS' });
  }, []);

  const handleThrowComplete = useCallback(() => {
    dispatch({ type: 'THROW_COMPLETE' });
  }, []);

  const aimRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (state.phase !== 'launchCrystals') {
      aimRef.current = { x: 0, y: 0 };
      return undefined;
    }

    const onMove = (e) => {
      aimRef.current = {
        x: Math.max(-1, Math.min(1, aimRef.current.x + e.movementX * 0.004)),
        y: Math.max(-0.5, Math.min(0.5, aimRef.current.y - e.movementY * 0.004)),
      };
      dispatch({ type: 'SET_THROW_AIM', aim: { ...aimRef.current } });
    };

    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [state.phase]);

  const handleRemoveCombatText = useCallback((id) => {
    dispatch({ type: 'REMOVE_COMBAT_TEXT', id });
  }, []);

  const showArena = state.phase !== 'onboarding';
  const isDramatic = ['firstAttack', 'counterAttack'].includes(state.phase);

  return (
    <FollowUpProvider>
    <div className={`app-root ${isDramatic ? 'arena-vignette' : ''}`}>
      {showArena && state.playerSide && (
        <Canvas
          camera={{ position: [0, 1.55, 0.5], fov: 50, near: 0.1, far: 80 }}
          style={{ touchAction: 'none' }}
        >
          <Suspense fallback={null}>
            <Arena
            playerSide={state.playerSide}
            opponentSide={state.opponentSide}
            round={round}
            phase={state.phase}
            activeEvidence={state.activeEvidence}
            inspectedEvidenceIds={state.inspectedEvidenceIds}
            failedEvidenceIds={state.failedEvidenceIds}
            explodingEvidenceId={state.explodingEvidenceId}
            isThrowingCrystals={state.isThrowingCrystals}
            throwPower={state.throwPower}
            throwAim={state.throwAim}
            onExplosionComplete={handleExplosionComplete}
            onThrowComplete={handleThrowComplete}
            />
          </Suspense>
        </Canvas>
      )}

      {!showArena && <div className="arena-placeholder" />}

      <HUD
        state={state}
        round={round}
        onAdvance={handleAdvance}
        onSelectSide={handleSelectSide}
        onSearchStart={handleSearchStart}
        onSearch={handleSearch}
        onMaterializeEvidence={handleMaterializeEvidence}
        onDismissEvidenceReveal={handleDismissEvidenceReveal}
        onAnswerQuiz={handleAnswerQuiz}
        onDismissQuiz={handleDismissQuiz}
        onThrowCrystals={handleThrowCrystals}
        onLockPower={handleLockPower}
        onPlayAgain={handlePlayAgain}
      />

      <CombatTextLayer texts={state.combatTexts} onRemove={handleRemoveCombatText} />

      {showArena && ['battle', 'launchCrystals', 'throwAnim'].includes(state.phase) && (
        <div className="fp-crosshair" aria-hidden="true" />
      )}

      {state.phase !== 'debateResult' && (
        <button type="button" className="demo-skip-btn" onClick={handleSkipToEnd}>
          Skip to End
        </button>
      )}

      <FollowUpTab />
      <FollowUpPanel />
    </div>
    </FollowUpProvider>
  );
}
