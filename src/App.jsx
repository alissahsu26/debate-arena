import { useReducer, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Arena from './components/Arena';
import HUD from './components/HUD';
import {
  INITIAL_METRICS,
  METRIC_KEYS,
  METRIC_LABELS,
  debateRounds,
} from './data/debateRounds';
import './index.css';

// TODO: persist progress to localStorage or backend
// TODO: connect RAG app for dynamic evidence / argument generation

let combatTextId = 0;

function clampMetric(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function applyMetricImpact(metrics, impact, multiplier = 1) {
  const next = { ...metrics };
  const deltas = [];

  METRIC_KEYS.forEach((key) => {
    if (impact[key] !== undefined) {
      const delta = Math.round(impact[key] * multiplier);
      next[key] = clampMetric(next[key] + delta);
      if (delta !== 0) {
        const sign = delta > 0 ? '+' : '';
        deltas.push({
          id: ++combatTextId,
          text: `${METRIC_LABELS[key]} ${sign}${delta}`,
          positive: delta > 0,
        });
      }
    }
  });

  return { metrics: next, deltas };
}

function getEvidenceMultiplier(inspectedIds, roundEvidence) {
  if (roundEvidence.every((e) => inspectedIds.includes(e.id))) return 1;
  if (inspectedIds.length > 0) return 0.5;
  return 0;
}

const initialState = {
  phase: 'selectSide',
  roundIndex: 0,
  playerSide: null,
  opponentSide: null,
  metrics: { ...INITIAL_METRICS },
  inspectedEvidenceIds: [],
  unlockedCardIds: [],
  combatTexts: [],
  throwingCardId: null,
  showHybridMessage: false,
  finalChoice: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SELECT_SIDE': {
      const playerSide = action.side;
      const opponentSide = playerSide === 'carnegie' ? 'mastery' : 'carnegie';
      return {
        ...state,
        playerSide,
        opponentSide,
        phase: 'challenge',
      };
    }

    case 'ADVANCE_PHASE': {
      const round = debateRounds[state.roundIndex];
      const transitions = {
        challenge: 'evidence',
        evidence: round.argumentCards?.length > 0 ? 'argument' : 'opponentCounter',
        opponentCounter: 'rebuttal',
        roundComplete:
          state.roundIndex + 1 >= debateRounds.length
            ? 'finalChoice'
            : 'challenge',
      };

      const nextPhase = transitions[state.phase];
      if (!nextPhase) return state;

      if (state.phase === 'roundComplete' && nextPhase === 'challenge') {
        return {
          ...state,
          phase: 'challenge',
          roundIndex: state.roundIndex + 1,
          inspectedEvidenceIds: [],
          unlockedCardIds: [],
          throwingCardId: null,
        };
      }

      return { ...state, phase: nextPhase };
    }

    case 'INSPECT_EVIDENCE': {
      if (state.inspectedEvidenceIds.includes(action.id)) return state;

      const round = debateRounds[state.roundIndex];
      const evidence = round.evidence.find((e) => e.id === action.id);
      const newInspected = [...state.inspectedEvidenceIds, action.id];
      const newUnlocked = [...state.unlockedCardIds];

      evidence?.unlocksCardIds?.forEach((cardId) => {
        const card = round.argumentCards?.find((c) => c.id === cardId);
        if (card) {
          const required = card.requiresEvidenceIds || round.evidence.map((e) => e.id);
          if (required.every((reqId) => newInspected.includes(reqId)) && !newUnlocked.includes(cardId)) {
            newUnlocked.push(cardId);
          }
        }
      });

      return {
        ...state,
        inspectedEvidenceIds: newInspected,
        unlockedCardIds: newUnlocked,
      };
    }

    case 'THROW_CARD': {
      return {
        ...state,
        phase: 'throwAnim',
        throwingCardId: action.cardId,
      };
    }

    case 'THROW_COMPLETE': {
      const round = debateRounds[state.roundIndex];
      const card = round.argumentCards.find((c) => c.id === action.cardId);
      if (!card) return { ...state, phase: 'opponentCounter', throwingCardId: null };

      const multiplier = getEvidenceMultiplier(state.inspectedEvidenceIds, round.evidence);
      const { metrics, deltas } = applyMetricImpact(state.metrics, card.metricImpact, multiplier);

      return {
        ...state,
        metrics,
        combatTexts: [...state.combatTexts, ...deltas],
        phase: 'opponentCounter',
        throwingCardId: null,
      };
    }

    case 'SELECT_REBUTTAL': {
      const round = debateRounds[state.roundIndex];
      const rebuttal = round.rebuttals.find((r) => r.id === action.rebuttalId);
      if (!rebuttal) return state;

      const evidenceMultiplier = getEvidenceMultiplier(state.inspectedEvidenceIds, round.evidence);
      const impact = rebuttal.isBest ? rebuttal.metricImpact : {};
      const { metrics, deltas } = applyMetricImpact(state.metrics, impact, evidenceMultiplier);

      return {
        ...state,
        metrics,
        combatTexts: [...state.combatTexts, ...deltas],
        phase: 'roundComplete',
      };
    }

    case 'FINAL_CHOICE': {
      return {
        ...state,
        finalChoice: action.choice,
        phase: action.choice === 'hybrid' ? 'hybridMessage' : 'finalMessage',
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
    const timer = setTimeout(() => onRemove(item.id), 1500);
    return () => clearTimeout(timer);
  }, [item.id, onRemove]);

  return (
    <div
      className={`combat-text ${item.positive ? 'positive' : 'negative'}`}
      style={{
        left: `${45 + (index % 3) * 8}%`,
        top: `${35 + Math.floor(index / 3) * 8}%`,
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

  const handleInspectEvidence = useCallback((id) => {
    dispatch({ type: 'INSPECT_EVIDENCE', id });
  }, []);

  const handleThrowCard = useCallback((card) => {
    dispatch({ type: 'THROW_CARD', cardId: card.id });
  }, []);

  const handleThrowComplete = useCallback((card) => {
    dispatch({ type: 'THROW_COMPLETE', cardId: card.id });
  }, []);

  const handleFinalChoice = useCallback((choice) => {
    dispatch({ type: 'FINAL_CHOICE', choice });
  }, []);

  const handleRemoveCombatText = useCallback((id) => {
    dispatch({ type: 'REMOVE_COMBAT_TEXT', id });
  }, []);

  const showArena = state.phase !== 'selectSide';

  return (
    <div className="app-root">
      {showArena && state.playerSide && (
        <Canvas shadows camera={{ position: [0, 8, 12], fov: 50 }}>
          <Arena
            playerSide={state.playerSide}
            opponentSide={state.opponentSide}
            round={round}
            phase={state.phase}
            inspectedEvidenceIds={state.inspectedEvidenceIds}
            unlockedCardIds={state.unlockedCardIds}
            throwingCardId={state.throwingCardId}
            onInspectEvidence={handleInspectEvidence}
            onThrowCard={handleThrowCard}
            onThrowComplete={handleThrowComplete}
          />
        </Canvas>
      )}

      {!showArena && <div className="arena-placeholder" />}

      <HUD
        state={state}
        dispatch={dispatch}
        round={round}
        onAdvance={handleAdvance}
        onFinalChoice={handleFinalChoice}
      />

      <CombatTextLayer texts={state.combatTexts} onRemove={handleRemoveCombatText} />
    </div>
  );
}
