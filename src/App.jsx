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
import { buildArgumentFromEvidence, getEvidenceMultiplier } from './services/argumentBuilder';
import './index.css';

let combatTextId = 0;

function clampMetric(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function applyMetricImpact(metrics, impact, multiplier = 1) {
  const next = { ...metrics };
  const deltas = [];

  METRIC_KEYS.forEach((key) => {
    if (impact[key] !== undefined && impact[key] !== 0) {
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

const initialState = {
  phase: 'onboarding',
  roundIndex: 0,
  playerSide: null,
  opponentSide: null,
  exchangePhase: 'attack',
  metrics: { ...INITIAL_METRICS },
  evidenceInventory: [],
  activeEvidence: [],
  inspectedEvidenceIds: [],
  argumentCard: null,
  combatTexts: [],
  throwingCardId: null,
  throwPower: 1,
  throwAim: { x: 0, y: 0 },
  throwPowerLocked: false,
  isSearching: false,
  showHybridMessage: false,
  finalChoice: null,
};

function resetExchangeState(state) {
  return {
    evidenceInventory: [],
    activeEvidence: [],
    inspectedEvidenceIds: [],
    argumentCard: null,
    throwPower: 1,
    throwAim: { x: 0, y: 0 },
    throwPowerLocked: false,
    throwingCardId: null,
  };
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'SELECT_SIDE': {
      const playerSide = action.side;
      const opponentSide = playerSide === 'carnegie' ? 'mastery' : 'carnegie';
      return {
        ...state,
        playerSide,
        opponentSide,
        phase: 'firstAttack',
        ...resetExchangeState(state),
        exchangePhase: 'attack',
      };
    }

    case 'ADVANCE_PHASE': {
      const transitions = {
        firstAttack: 'buildCase',
        buildCase: 'launchArgument',
        counterAttack: 'buildCase',
        roundComplete:
          state.roundIndex + 1 >= debateRounds.length ? 'finalChoice' : 'firstAttack',
      };

      const nextPhase = transitions[state.phase];
      if (!nextPhase) return state;

      if (state.phase === 'buildCase' && nextPhase === 'launchArgument') {
        const inspected = state.activeEvidence.filter((e) =>
          state.inspectedEvidenceIds.includes(e.id)
        );
        const argumentCard = buildArgumentFromEvidence(inspected);
        return {
          ...state,
          phase: 'launchArgument',
          argumentCard,
          throwPowerLocked: false,
          throwPower: 1,
        };
      }

      if (state.phase === 'counterAttack' && nextPhase === 'buildCase') {
        return {
          ...state,
          phase: 'buildCase',
          exchangePhase: 'counter',
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
      return {
        ...state,
        evidenceInventory: [...state.evidenceInventory, ...newItems],
        isSearching: false,
      };
    }

    case 'MATERIALIZE_EVIDENCE': {
      if (state.activeEvidence.some((e) => e.id === action.id)) return state;
      const evidence = state.evidenceInventory.find((e) => e.id === action.id);
      if (!evidence) return state;
      return {
        ...state,
        activeEvidence: [...state.activeEvidence, evidence],
      };
    }

    case 'SET_SEARCHING': {
      return { ...state, isSearching: action.value };
    }

    case 'INSPECT_EVIDENCE': {
      if (state.inspectedEvidenceIds.includes(action.id)) return state;

      const evidence = state.activeEvidence.find((e) => e.id === action.id);
      if (!evidence) return state;

      const newInspected = [...state.inspectedEvidenceIds, action.id];
      const { metrics, deltas } = applyMetricImpact(state.metrics, evidence.effect || {}, 1);

      return {
        ...state,
        inspectedEvidenceIds: newInspected,
        metrics,
        combatTexts: [...state.combatTexts, ...deltas],
      };
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

    case 'THROW_CARD': {
      if (!state.throwPowerLocked) return state;
      return {
        ...state,
        phase: 'throwAnim',
        throwingCardId: state.argumentCard?.id,
        throwPower: action.power ?? state.throwPower,
        throwAim: action.aim ?? state.throwAim,
      };
    }

    case 'THROW_COMPLETE': {
      const card = state.argumentCard;
      if (!card) {
        return {
          ...state,
          phase: state.exchangePhase === 'attack' ? 'counterAttack' : 'roundComplete',
          throwingCardId: null,
        };
      }

      const evidenceMultiplier = getEvidenceMultiplier(state.inspectedEvidenceIds.length);
      const totalMultiplier = evidenceMultiplier * state.throwPower;
      const { metrics, deltas } = applyMetricImpact(state.metrics, card.metricImpact, totalMultiplier);

      const nextPhase = state.exchangePhase === 'attack' ? 'counterAttack' : 'roundComplete';

      return {
        ...state,
        metrics,
        combatTexts: [...state.combatTexts, ...deltas],
        phase: nextPhase,
        throwingCardId: null,
        throwPowerLocked: false,
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

  const handleSelectSide = useCallback((side) => {
    dispatch({ type: 'SELECT_SIDE', side });
  }, []);

  const handleInspectEvidence = useCallback((id) => {
    dispatch({ type: 'INSPECT_EVIDENCE', id });
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

  const handleThrowAim = useCallback((aim) => {
    dispatch({ type: 'SET_THROW_AIM', aim });
  }, []);

  const handleLockPower = useCallback((power) => {
    dispatch({ type: 'LOCK_THROW_POWER', power });
  }, []);

  const handleThrowCard = useCallback(() => {
    dispatch({ type: 'THROW_CARD' });
  }, []);

  const handleThrowComplete = useCallback(() => {
    dispatch({ type: 'THROW_COMPLETE' });
  }, []);

  const handleFinalChoice = useCallback((choice) => {
    dispatch({ type: 'FINAL_CHOICE', choice });
  }, []);

  const handleRemoveCombatText = useCallback((id) => {
    dispatch({ type: 'REMOVE_COMBAT_TEXT', id });
  }, []);

  const showArena = state.phase !== 'onboarding';
  const isDramatic = ['firstAttack', 'counterAttack'].includes(state.phase);

  return (
    <div className={`app-root ${isDramatic ? 'arena-vignette' : ''}`}>
      {showArena && state.playerSide && (
        <Canvas camera={{ position: [0, 1.55, 0.5], fov: 55, near: 0.1, far: 80 }}>
          <Arena
            playerSide={state.playerSide}
            opponentSide={state.opponentSide}
            round={round}
            phase={state.phase}
            activeEvidence={state.activeEvidence}
            inspectedEvidenceIds={state.inspectedEvidenceIds}
            argumentCard={state.argumentCard}
            throwingCardId={state.throwingCardId}
            throwPower={state.throwPower}
            throwAim={state.throwAim}
            onInspectEvidence={handleInspectEvidence}
            onThrowAim={handleThrowAim}
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
        onSelectSide={handleSelectSide}
        onSearchStart={handleSearchStart}
        onSearch={handleSearch}
        onMaterializeEvidence={handleMaterializeEvidence}
        onThrowCard={handleThrowCard}
        onLockPower={handleLockPower}
        onFinalChoice={handleFinalChoice}
      />

      <CombatTextLayer texts={state.combatTexts} onRemove={handleRemoveCombatText} />

      {showArena && ['buildCase', 'launchArgument', 'throwAnim'].includes(state.phase) && (
        <div className="fp-crosshair" aria-hidden="true" />
      )}
    </div>
  );
}
