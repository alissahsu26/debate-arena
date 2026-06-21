import { useState, useEffect, useCallback } from 'react';

export default function BattleDialog({ speaker, text, subtitle, onContinue }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [text]);

  const handleClick = useCallback(() => {
    if (!done) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    onContinue();
  }, [done, text, onContinue]);

  return (
    <div
      className="battle-dialog"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="rpg-box battle-dialog-box">
        <p className="rpg-heading battle-dialog-speaker">{speaker}</p>
        {subtitle && <p className="battle-dialog-subtitle">{subtitle}</p>}
        <p className="rpg-body battle-dialog-text">
          {displayed}
          {!done && <span className="battle-dialog-cursor">▌</span>}
        </p>
        {done && <span className="battle-dialog-arrow" aria-hidden="true">▼</span>}
      </div>
    </div>
  );
}
