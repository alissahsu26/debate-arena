import Character from './Character';
import EvidenceCrystal from './EvidenceCrystal';
import ArgumentCard from './ArgumentCard';
import FirstPersonCamera from './FirstPersonCamera';

const CRYSTAL_POSITIONS = [
  [-1.5, 1.35, -1.9],
  [0, 1.55, -2.4],
  [1.5, 1.35, -1.9],
];

const OPPONENT_POSITION = [0, 0, -3.5];
const OPPONENT_ROTATION = [0, Math.PI, 0];
const CARD_POSITION = [0.85, 1.0, -0.7];

export default function Arena({
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
      <fog attach="fog" args={['#1a1a2e', 14, 30]} />

      <ambientLight intensity={0.65} />
      <hemisphereLight args={['#6a7ab8', '#1a1a2e', 0.5]} />
      <directionalLight position={[2, 8, 4]} intensity={1.4} />
      <pointLight position={[0, 2.5, -3.5]} intensity={2.5} color="#c8b8ff" distance={12} />
      <pointLight position={[0, 1.5, -1]} intensity={0.8} color="#88ccff" distance={8} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.5]}>
        <planeGeometry args={[14, 10]} />
        <meshBasicMaterial color="#2d3561" toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -1.5]}>
        <ringGeometry args={[0.4, 5.5, 48]} />
        <meshBasicMaterial color="#4A90D9" transparent opacity={0.35} toneMapped={false} />
      </mesh>

      <Character
        type={opponentSide}
        position={OPPONENT_POSITION}
        rotation={OPPONENT_ROTATION}
        scale={1.35}
      />

      {round.evidence.map((item, index) => (
        <EvidenceCrystal
          key={item.id}
          id={item.id}
          position={CRYSTAL_POSITIONS[index] || [0, 1.5, -2]}
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

      <FirstPersonCamera />
    </>
  );
}
