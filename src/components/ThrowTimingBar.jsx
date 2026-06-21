import { useState, useEffect, useRef, useCallback } from 'react';

const CYCLE_MS = 1800;

export default function ThrowTimingBar({ onLock, locked, throwPower }) {
  const [position, setPosition] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (locked) return undefined;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = (timestamp - startRef.current) % CYCLE_MS;
      const t = elapsed / CYCLE_MS;
      const wave = Math.sin(t * Math.PI * 2);
      setPosition((wave + 1) / 2);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [locked]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.code === 'Space' && !locked) {
        e.preventDefault();
        const distFromCenter = Math.abs(position - 0.5) * 2;
        const power = Math.max(0.3, 1.5 - distFromCenter * 1.2);
        onLock(power, position);
      }
    },
    [locked, position, onLock]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const greenCenter = 0.5;
  const distFromGreen = Math.abs(position - greenCenter);
  const nearGreen = distFromGreen < 0.08;

  return (
    <div className="timing-bar-container">
      <p className="timing-bar-label">
        {locked
          ? `Power locked: ${Math.round((throwPower || 0) * 100)}%${throwPower >= 1.2 ? ' — CRITICAL!' : ''}`
          : 'Press SPACE when the indicator is in the green zone'}
      </p>
      <div className="timing-bar-track">
        <div className="timing-bar-green-zone" />
        <div
          className={`timing-bar-needle ${nearGreen && !locked ? 'near-green' : ''}`}
          style={{ left: `${locked ? 50 : position * 100}%` }}
        />
      </div>
      {!locked && (
        <p className="timing-bar-hint">Drag the argument card to aim, then press Space for power.</p>
      )}
    </div>
  );
}
