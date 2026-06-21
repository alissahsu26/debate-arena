import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { CHARACTERS } from '../data/debateRounds';

export default function Character({ type, position = [0, 0, 0], isPlayer = false }) {
  const groupRef = useRef();
  const character = CHARACTERS[type];

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.08;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* TODO: replace placeholder geometry with GLTF model via useGLTF */}
      {type === 'carnegie' ? (
        <>
          <mesh castShadow position={[0, 0.75, 0]}>
            <boxGeometry args={[1, 1.5, 1]} />
            <meshStandardMaterial color={character.color} />
          </mesh>
          {/* Glasses-like wireframe */}
          <mesh position={[0, 1.1, 0.51]}>
            <boxGeometry args={[0.9, 0.25, 0.05]} />
            <meshBasicMaterial color="#ffffff" wireframe />
          </mesh>
        </>
      ) : (
        <>
          <mesh castShadow position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 1.5, 16]} />
            <meshStandardMaterial color={character.color} />
          </mesh>
          {/* Wizard hat-like cone */}
          <mesh castShadow position={[0, 1.65, 0]}>
            <coneGeometry args={[0.55, 0.9, 16]} />
            <meshStandardMaterial color="#6C3483" />
          </mesh>
        </>
      )}

      <Html
        center
        position={[0, type === 'carnegie' ? 2.4 : 2.7, 0]}
        style={{
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
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
