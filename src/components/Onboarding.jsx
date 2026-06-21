import { useState } from 'react';
import { CHARACTERS } from '../data/debateRounds';

const CHAMPIONS = {
  mastery: {
    ...CHARACTERS.mastery,
    title: 'Mastery Lizard Wizard',
    art: '/images/onboarding/wizard-art.png',
    theme: 'mastery',
  },
  carnegie: {
    ...CHARACTERS.carnegie,
    title: 'Cat Scholar',
    art: '/images/onboarding/scholar-art.png',
    theme: 'carnegie',
  },
};

function ChampionCard({ champion, side, selected, onSelect }) {
  const isSelected = selected === side;

  return (
    <button
      type="button"
      className={`champion-card champion-card--${champion.theme} ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(side)}
      aria-pressed={isSelected}
    >
      <h2 className="champion-card-title">{champion.title}</h2>
      <div className="champion-card-art">
        <img src={champion.art} alt="" draggable={false} />
      </div>
      <div className="champion-card-info">
        <h3 className="champion-card-side">{champion.side}</h3>
        <p className="champion-card-desc">{champion.description}</p>
      </div>
    </button>
  );
}

export default function Onboarding({ onSelectSide }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="onboarding">
      <header className="onboarding-header">
        <h1 className="onboarding-title">Choose Your Side</h1>
        <p className="onboarding-subtitle">Pick a side to defend</p>
      </header>

      <div className="onboarding-arena">
        <div className="champion-cards">
          <ChampionCard
            champion={CHAMPIONS.mastery}
            side="mastery"
            selected={selected}
            onSelect={setSelected}
          />
          <ChampionCard
            champion={CHAMPIONS.carnegie}
            side="carnegie"
            selected={selected}
            onSelect={setSelected}
          />
        </div>
      </div>

      <footer className="onboarding-footer">
        <button
          type="button"
          className="onboarding-confirm"
          disabled={!selected}
          onClick={() => selected && onSelectSide(selected)}
        >
          <span className="onboarding-arrow onboarding-arrow--left" aria-hidden="true">
            ◀
          </span>
          <span>{selected ? 'Enter the Arena' : 'Select Your Champion'}</span>
          <span className="onboarding-arrow onboarding-arrow--right" aria-hidden="true">
            ▶
          </span>
        </button>
      </footer>
    </div>
  );
}
