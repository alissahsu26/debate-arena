import { useState, useEffect, useRef, useCallback } from 'react';

const CYCLE_MS = 1800;

export default function ThrowTimingBar({ onLock, locked, throwPower }) {
  const [position, setPosition] = useState(0);
  const [lockedPosition, setLockedPosition] = useState(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const positionRef = useRef(0);

  useEffect(() => {
    if (locked) return undefined;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = (timestamp - startRef.current) % CYCLE_MS;
      const t = elapsed / CYCLE_MS;
      const wave = Math.sin(t * Math.PI * 2);
      const nextPosition = (wave + 1) / 2;
      positionRef.current = nextPosition;
      setPosition(nextPosition);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [locked]);

  useEffect(() => {
    if (!locked) {
      setLockedPosition(null);
    }
  }, [locked]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.code === 'Space' && !locked) {
        e.preventDefault();
        const lockPos = positionRef.current;
        const distFromCenter = Math.abs(lockPos - 0.5) * 2;
        const power = Math.max(0.3, 1.5 - distFromCenter * 1.2);
        setLockedPosition(lockPos);
        onLock(power, lockPos);
      }
    },
    [locked, onLock]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const greenCenter = 0.5;
  const needlePosition = locked ? (lockedPosition ?? position) : position;
  const distFromGreen = Math.abs(needlePosition - greenCenter);
  const nearGreen = distFromGreen < 0.08;
  const isCritical = locked && throwPower >= 1.2;

  return (
    <div className="rpg-box timing-bar-container">
      <div className="timing-bar-header">
        <span className="rpg-heading timing-bar-title">PWR</span>
        <span className={`timing-bar-status ${isCritical ? 'critical' : ''}`}>
          {locked
            ? `${Math.round((throwPower || 0) * 100)}%${isCritical ? ' CRITICAL!' : ''}`
            : 'Press SPACE in the green zone'}
        </span>
      </div>
      <div className="timing-bar-track">
        <div className="timing-bar-segments" aria-hidden="true">
          {Array.from({ length: 20 }, (_, i) => {
            const segmentCenter = (i + 0.5) / 20;
            const inGreen = Math.abs(segmentCenter - 0.5) < 0.05;
            return (
              <span
                key={i}
                className={`timing-bar-segment ${inGreen ? 'sweet' : 'danger'}`}
              />
            );
          })}
        </div>
        <div
          className={`timing-bar-needle ${nearGreen && !locked ? 'near-green' : ''}`}
          style={{ left: `${needlePosition * 100}%` }}
        />
      </div>
      {!locked && (
        <p className="rpg-hint timing-bar-hint">
          Move the crosshair to aim, then press Space for power.
        </p>
      )}
    </div>
  );
}
