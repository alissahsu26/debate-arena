import Character from './Character';
import EvidenceCrystal from './EvidenceCrystal';
import ArgumentCard from './ArgumentCard';
import FirstPersonCamera from './FirstPersonCamera';

const CRYSTAL_POSITIONS = [
  [-1.5, 0.35, -1.9],
  [0, 0.55, -2.4],
  [1.5, 0.35, -1.9],
  [-2.2, 0.45, -2.2],
  [2.2, 0.45, -2.2],
  [0, 0.75, -1.6],
];

const OPPONENT_POSITION = [0, 0, -5];
const OPPONENT_ROTATION = [0, 0, 0];
const CARD_POSITION = [0.85, 1.0, -0.7];
const OPPONENT_LOOK_Y = 1.4;

export default function Arena({
  opponentSide,
  phase,
  activeEvidence,
  inspectedEvidenceIds,
  argumentCard,
  throwingCardId,
  throwPower,
  throwAim,
  onInspectEvidence,
  onThrowAim,
  onThrowComplete,
}) {
  const showCrystals = ['buildCase', 'launchArgument', 'throwAnim'].includes(phase);
  const showCard = ['launchArgument', 'throwAnim'].includes(phase) && argumentCard;
  const isDramatic = ['firstAttack', 'counterAttack'].includes(phase);

  const ambientIntensity = isDramatic ? 0.45 : 0.75;
  const hemiIntensity = isDramatic ? 0.45 : 0.55;
  const dirIntensity = isDramatic ? 1.0 : 1.6;
  const fogNear = isDramatic ? 12 : 22;
  const fogFar = isDramatic ? 32 : 50;

  const targetOffset = throwAim
    ? [OPPONENT_POSITION[0] + throwAim.x * 2, OPPONENT_LOOK_Y + throwAim.y * 1.5, OPPONENT_POSITION[2]]
    : [OPPONENT_POSITION[0], OPPONENT_LOOK_Y, OPPONENT_POSITION[2]];

  return (
    <>
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', fogNear, fogFar]} />

      <ambientLight intensity={ambientIntensity} />
      <hemisphereLight args={['#6a7ab8', '#1a1a2e', hemiIntensity]} />
      <directionalLight position={[0, 4, 6]} intensity={dirIntensity} color="#ffffff" />
      <directionalLight position={[0, 3, -2]} intensity={0.6} color="#c8d0ff" />
      <pointLight
        position={[OPPONENT_POSITION[0], 2.8, OPPONENT_POSITION[2] + 2]}
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
        position={OPPONENT_POSITION}
        rotation={OPPONENT_ROTATION}
        scale={1.6}
        isDramatic={isDramatic}
      />

      {activeEvidence.map((item, index) => (
        <EvidenceCrystal
          key={item.id}
          id={item.id}
          evidence={item}
          position={CRYSTAL_POSITIONS[index] || [0, 1.5, -2]}
          inspected={inspectedEvidenceIds.includes(item.id)}
          onInspect={onInspectEvidence}
          active={showCrystals}
        />
      ))}

      {showCard && (
        <ArgumentCard
          card={argumentCard}
          position={CARD_POSITION}
          targetPosition={targetOffset}
          isThrowing={throwingCardId === argumentCard.id}
          throwPower={throwPower}
          onThrowAim={onThrowAim}
          onThrowComplete={onThrowComplete}
          active
        />
      )}

      <FirstPersonCamera opponentPosition={OPPONENT_POSITION} />
    </>
  );
}
