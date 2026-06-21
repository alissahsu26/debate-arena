import { useState } from 'react';
import { CHARACTERS } from '../data/debateRounds';

export default function Onboarding({ onSelectSide }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="onboarding">
      <div className="onboarding-content">
        <h1 className="onboarding-title">Choose Your Side</h1>
        <p className="onboarding-subtitle">Every school makes tradeoffs.</p>
        <p className="onboarding-desc">
          Step into the arena and defend the educational model you believe creates the best learning
          experience.
        </p>

        <div className="side-cards">
          <button
            type="button"
            className={`side-card side-card-mastery ${selected === 'mastery' ? 'selected' : ''}`}
            onClick={() => setSelected('mastery')}
          >
            <span className="side-card-name">{CHARACTERS.mastery.side}</span>
            <span className="side-card-desc">{CHARACTERS.mastery.description}</span>
          </button>
          <button
            type="button"
            className={`side-card side-card-carnegie ${selected === 'carnegie' ? 'selected' : ''}`}
            onClick={() => setSelected('carnegie')}
          >
            <span className="side-card-name">{CHARACTERS.carnegie.side}</span>
            <span className="side-card-desc">{CHARACTERS.carnegie.description}</span>
          </button>
        </div>

        <button
          type="button"
          className="btn btn-primary onboarding-enter"
          disabled={!selected}
          onClick={() => selected && onSelectSide(selected)}
        >
          Enter the Arena
        </button>
      </div>
    </div>
  );
}
