import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
  default: '#00E5FF',
  confirmed: '#76FF03',
  exploding: '#FF5252',
};

const CATEGORY_COLORS = {
  'District Data': '#4A90D9',
  'Teacher Perspectives': '#9B59B6',
  'Academic Research': '#FF9800',
};

export default function EvidenceCrystal({
  id,
  evidence,
  position,
  confirmed,
  exploding,
  failed,
  isThrowing,
  throwPower = 1,
  targetPosition,
  throwIndex = 0,
  onExplosionComplete,
  onThrowComplete,
  onHit,
  active,
}) {
  const groupRef = useRef();
  const spawnRef = useRef(0);
  const explosionRef = useRef(0);
  const throwRef = useRef(0);
  const throwDoneRef = useRef(false);
  const startPos = useRef(new THREE.Vector3(...position));
  const endPos = useRef(new THREE.Vector3(...(targetPosition || [0, 1.5, -4.2])));

  useEffect(() => {
    if (!exploding) {
      explosionRef.current = 0;
    }
  }, [exploding]);

  useEffect(() => {
    if (!isThrowing) {
      throwRef.current = 0;
      throwDoneRef.current = false;
      return;
    }
    const p = groupRef.current?.position;
    startPos.current.set(p?.x ?? position[0], p?.y ?? position[1], p?.z ?? position[2]);
    endPos.current.set(...(targetPosition || [0, 1.5, -4.2]));
    throwRef.current = 0;
  }, [isThrowing, position, targetPosition]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isThrowing) {
      const delay = throwIndex * 0.12;
      throwRef.current = Math.min(throwRef.current + delta * (1.1 + throwPower * 0.6), 1 + delay);
      const t = Math.max(0, Math.min((throwRef.current - delay) / (1 - delay * 0.5), 1));
      const arcHeight = (1.2 + throwPower) * Math.sin(t * Math.PI);
      groupRef.current.position.lerpVectors(startPos.current, endPos.current, t);
      groupRef.current.position.y =
        THREE.MathUtils.lerp(startPos.current.y, endPos.current.y, t) + arcHeight;
      groupRef.current.rotation.y += delta * (4 + throwPower * 2);

      if (t >= 1 && !throwDoneRef.current) {
        throwDoneRef.current = true;
        onHit?.();
        onThrowComplete?.();
      }
      return;
    }

    if (exploding) {
      explosionRef.current = Math.min(explosionRef.current + delta * 1.2, 1);
      const t = explosionRef.current;
      groupRef.current.rotation.y += 0.15;
      groupRef.current.scale.setScalar(1 + t * 1.8);
      groupRef.current.position.y = position[1] + t * 0.6;

      if (t >= 1) {
        onExplosionComplete?.(id);
      }
      return;
    }

    spawnRef.current = Math.min(spawnRef.current + 0.02, 1);
    groupRef.current.rotation.y += 0.025;
    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.12;
    groupRef.current.scale.setScalar(spawnRef.current);
  });

  if (!active) return null;

  const color = exploding
    ? COLORS.exploding
    : confirmed
      ? COLORS.confirmed
      : CATEGORY_COLORS[evidence?.category] || COLORS.default;

  const opacity = exploding ? Math.max(0, 1 - explosionRef.current * 1.2) : 1;

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]} frustumCulled={false}>
      <mesh frustumCulled={false}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={opacity} />
      </mesh>
      {!exploding && !isThrowing && (
        <>
          <mesh frustumCulled={false} scale={1.25}>
            <octahedronGeometry args={[0.55, 0]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={0.5} toneMapped={false} />
          </mesh>
          <mesh frustumCulled={false} scale={1.6}>
            <octahedronGeometry args={[0.55, 0]} />
            <meshBasicMaterial color={color} transparent opacity={0.12} toneMapped={false} />
          </mesh>
        </>
      )}
      {!exploding && !failed && !isThrowing && (
        <pointLight color={color} intensity={4} distance={6} decay={1} />
      )}

      {confirmed && evidence && !exploding && !isThrowing && (
        <Html
          center
          position={[0, 1.1, 0]}
          distanceFactor={5}
          style={{
            color: 'white',
            fontSize: '10px',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 4px rgba(0,0,0,0.9)',
            pointerEvents: 'none',
            userSelect: 'none',
            background: 'rgba(0,0,0,0.6)',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          {evidence.label}
        </Html>
      )}
    </group>
  );
}
