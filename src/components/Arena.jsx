import { OrbitControls } from '@react-three/drei';
import Character from './Character';
import EvidenceCrystal from './EvidenceCrystal';
import ArgumentCard from './ArgumentCard';

const CRYSTAL_POSITIONS = [
  [-1.5, 1.5, 2.5],
  [0, 1.8, 0],
  [1.5, 1.5, -2.5],
];

const PLAYER_POSITION = [-3, 0, 0];
const OPPONENT_POSITION = [3, 0, 0];
const CARD_POSITION = [-2.2, 2, 0.5];

export default function Arena({
  playerSide,
  opponentSide,
  round,
  phase,
  inspectedEvidenceIds,
  unlockedCardIds,
  throwingCardId,
  onInspectEvidence,
  onThrowCard,
  onThrowComplete,
}) {
  const showCrystals = ['evidence', 'argument', 'throwAnim'].includes(phase);
  const showCards = ['argument', 'throwAnim'].includes(phase) && round.argumentCards?.length > 0;

  const isCardUnlocked = (card) => {
    if (unlockedCardIds.includes(card.id)) return true;
    const required = card.requiresEvidenceIds || round.evidence.map((e) => e.id);
    return required.every((id) => inspectedEvidenceIds.includes(id));
  };

  return (
    <>
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', 15, 35]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

      {/* Circular platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
        <cylinderGeometry args={[8, 8, 0.2, 48]} />
        <meshStandardMaterial color="#2d3561" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[7.5, 8, 48]} />
        <meshBasicMaterial color="#4A90D9" transparent opacity={0.4} />
      </mesh>

      <Character type={playerSide} position={PLAYER_POSITION} isPlayer />
      <Character type={opponentSide} position={OPPONENT_POSITION} />

      {round.evidence.map((item, index) => (
        <EvidenceCrystal
          key={item.id}
          id={item.id}
          position={CRYSTAL_POSITIONS[index] || [0, 1.5, 0]}
          inspected={inspectedEvidenceIds.includes(item.id)}
          onInspect={onInspectEvidence}
          active={showCrystals}
        />
      ))}

      {round.argumentCards?.map((card) => (
        <ArgumentCard
          key={card.id}
          card={card}
          position={CARD_POSITION}
          targetPosition={[OPPONENT_POSITION[0], 1.5, OPPONENT_POSITION[2]]}
          unlocked={isCardUnlocked(card)}
          isThrowing={throwingCardId === card.id}
          onThrow={onThrowCard}
          onThrowComplete={onThrowComplete}
          active={showCards}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={8}
        maxDistance={18}
        target={[0, 1, 0]}
      />
    </>
  );
}
