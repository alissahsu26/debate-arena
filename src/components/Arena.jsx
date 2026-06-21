import { useCallback, useEffect, useState } from 'react';
import Character from './Character';
import EvidenceCrystal from './EvidenceCrystal';
import FirstPersonCamera from './FirstPersonCamera';

const CRYSTAL_POSITIONS = [
  [-2.5, 1, -3.9],
  [0, 0.55, -2.4],
  [1.5, 0.35, -1.9],
  [-2.2, 0.45, -2.2],
  [2.2, 0.45, -2.2],
  [0, 0.75, -1.6],
];

// Arena placement per opponent model (carnegie = scholar.glb, mastery = wizard.glb)
const CHARACTER_ARENA_SETTINGS = {
  carnegie: {
    position: [0, -1.2, -12.5],
    rotation: [0, Math.PI, 0],
    scale: 0.09,
    lookY: 1.5,
  },
  mastery: {
    position: [0, -0.8, -10.5],
    rotation: [0, Math.PI, 0],
    scale: 1.2,
    lookY: 1.5,
  },
};

const PHASES_HIDE_3D_NAME_LABEL = new Set([
  'buildCase',
  'battle',
  'roundComplete',
  'debateResult',
]);

export default function Arena({
  opponentSide,
  phase,
  activeEvidence,
  inspectedEvidenceIds,
  failedEvidenceIds,
  explodingEvidenceId,
  isThrowingCrystals,
  throwPower,
  throwAim,
  onExplosionComplete,
  onThrowComplete,
}) {
  const showCrystals = ['battle', 'launchCrystals', 'throwAnim'].includes(phase);
  const isThrowPhase = phase === 'throwAnim' && isThrowingCrystals;
  const isDramatic = ['firstAttack', 'counterAttack'].includes(phase);

  const ambientIntensity = isDramatic ? 0.45 : 0.75;
  const hemiIntensity = isDramatic ? 0.45 : 0.55;
  const dirIntensity = isDramatic ? 1.0 : 1.6;
  const fogNear = isDramatic ? 12 : 22;
  const fogFar = isDramatic ? 32 : 50;

  const opponentSettings = CHARACTER_ARENA_SETTINGS[opponentSide] ?? CHARACTER_ARENA_SETTINGS.mastery;
  const { position: opponentPosition, rotation: opponentRotation, scale: opponentScale, lookY } =
    opponentSettings;

  const targetOffset = throwAim
    ? [opponentPosition[0] + throwAim.x * 2, lookY + throwAim.y * 1.5, opponentPosition[2]]
    : [opponentPosition[0], lookY, opponentPosition[2]];

  const visibleEvidence =
    phase === 'launchCrystals' || phase === 'throwAnim'
      ? activeEvidence.filter((e) => inspectedEvidenceIds.includes(e.id))
      : activeEvidence;

  const confirmedCount = visibleEvidence.length;
  const [attackTrigger, setAttackTrigger] = useState(0);
  const [hitTrigger, setHitTrigger] = useState(0);
  const handleCrystalHit = useCallback(() => setHitTrigger((n) => n + 1), []);

  useEffect(() => {
    if (isThrowPhase) setAttackTrigger((n) => n + 1);
  }, [isThrowPhase]);

  return (
    <>
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', fogNear, fogFar]} />

      <ambientLight intensity={ambientIntensity} />
      <hemisphereLight args={['#6a7ab8', '#1a1a2e', hemiIntensity]} />
      <directionalLight position={[0, 4, 6]} intensity={dirIntensity} color="#ffffff" />
      <directionalLight position={[0, 3, -2]} intensity={0.6} color="#c8d0ff" />
      <pointLight
        position={[opponentPosition[0], 2.8, opponentPosition[2] + 2]}
        intensity={4}
        color="#ffffff"
        distance={16}
      />
      <pointLight position={[0, 2.5, -3.5]} intensity={isDramatic ? 0.5 : 1.2} color="#c8b8ff" distance={14} />
      <pointLight position={[0, 1.5, -1]} intensity={isDramatic ? 0.4 : 0.9} color="#88ccff" distance={10} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.5]}>
        <planeGeometry args={[14, 10]} />
        <meshBasicMaterial color={isDramatic ? '#1a1f3a' : '#2d3561'} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -1.5]}>
        <ringGeometry args={[0.4, 5.5, 48]} />
        <meshBasicMaterial
          color={isDramatic ? '#2a3050' : '#4A90D9'}
          transparent
          opacity={isDramatic ? 0.15 : 0.35}
          toneMapped={false}
        />
      </mesh>

      <Character
        type={opponentSide}
        position={opponentPosition}
        rotation={opponentRotation}
        scale={opponentScale}
        isDramatic={isDramatic}
        showNameLabel={!PHASES_HIDE_3D_NAME_LABEL.has(phase)}
        isUnderAttack={isThrowPhase}
        attackTrigger={attackTrigger}
        hitTrigger={hitTrigger}
      />

      {visibleEvidence.map((item, index) => (
        <EvidenceCrystal
          key={item.id}
          id={item.id}
          evidence={item}
          position={CRYSTAL_POSITIONS[index] || [0, 1.5, -2]}
          confirmed={inspectedEvidenceIds.includes(item.id)}
          exploding={explodingEvidenceId === item.id}
          failed={failedEvidenceIds.includes(item.id)}
          isThrowing={isThrowPhase}
          throwPower={throwPower}
          targetPosition={targetOffset}
          throwIndex={index}
          onExplosionComplete={onExplosionComplete}
          onHit={isThrowPhase ? handleCrystalHit : undefined}
          onThrowComplete={
            isThrowPhase && index === confirmedCount - 1 ? onThrowComplete : undefined
          }
          active={showCrystals}
        />
      ))}

      <FirstPersonCamera opponentPosition={opponentPosition} lookY={lookY} />
    </>
  );
}
