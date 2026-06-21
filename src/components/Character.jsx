import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { CHARACTERS } from '../data/debateRounds';

export default function Character({
  type,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  isPlayer = false,
}) {
  const groupRef = useRef();
  const character = CHARACTERS[type];

  useFrame((state) => {
    if (!groupRef.current) return;
    const bob = Math.sin(state.clock.elapsedTime * 2) * 0.06;
    groupRef.current.position.set(position[0], position[1] + bob, position[2]);
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {type === 'carnegie' ? (
        <>
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[1, 1.5, 1]} />
            <meshBasicMaterial color={character.color} toneMapped={false} />
          </mesh>
          <mesh position={[0, 1.1, 0.51]}>
            <boxGeometry args={[0.9, 0.25, 0.05]} />
            <meshBasicMaterial color="#ffffff" wireframe toneMapped={false} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 1.5, 16]} />
            <meshBasicMaterial color={character.color} toneMapped={false} />
          </mesh>
          <mesh position={[0, 1.65, 0]}>
            <coneGeometry args={[0.55, 0.9, 16]} />
            <meshBasicMaterial color="#B07CE8" toneMapped={false} />
          </mesh>
        </>
      )}

      <Html
        center
        distanceFactor={6}
        position={[0, type === 'carnegie' ? 2.2 : 2.5, 0]}
        style={{
          color: 'white',
          fontSize: '13px',
          fontWeight: 'bold',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          textShadow: '0 1px 6px rgba(0,0,0,0.9)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {character.label}
        {isPlayer && <div style={{ fontSize: '10px', color: '#FFD700' }}>(You)</div>}
      </Html>
    </group>
  );
}
