import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function ArgumentCard({
  card,
  position,
  targetPosition,
  unlocked,
  isThrowing,
  onThrow,
  onThrowComplete,
  active,
}) {
  const meshRef = useRef();
  const progressRef = useRef(0);
  const [localThrowing, setLocalThrowing] = useState(false);
  const startPos = useRef(new THREE.Vector3(...position));
  const endPos = useRef(new THREE.Vector3(...(targetPosition || [3, 1.5, 0])));

  useEffect(() => {
    if (isThrowing) {
      setLocalThrowing(true);
      progressRef.current = 0;
      startPos.current.set(...position);
    }
  }, [isThrowing, position]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (localThrowing) {
      progressRef.current = Math.min(progressRef.current + delta * 1.5, 1);
      const t = progressRef.current;
      const arc = Math.sin(t * Math.PI) * 1.5;
      meshRef.current.position.lerpVectors(startPos.current, endPos.current, t);
      meshRef.current.position.y = THREE.MathUtils.lerp(startPos.current.y, endPos.current.y, t) + arc;
      meshRef.current.rotation.y += 0.15;

      if (t >= 1) {
        setLocalThrowing(false);
        onThrowComplete(card);
      }
    } else {
      meshRef.current.position.set(...position);
      meshRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });

  if (!active) return null;

  const canClick = unlocked && !localThrowing && !isThrowing;

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (canClick) onThrow(card);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (canClick) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      {/* TODO: arc trajectory polish, trail particles, impact SFX */}
      <planeGeometry args={[1.4, 0.9]} />
      <meshStandardMaterial
        color={unlocked ? '#FFD54F' : '#555555'}
        transparent
        opacity={unlocked ? 0.95 : 0.35}
        side={THREE.DoubleSide}
        emissive={unlocked ? '#FFA000' : '#000000'}
        emissiveIntensity={unlocked ? 0.3 : 0}
      />
      <Html
        center
        transform
        distanceFactor={6}
        style={{
          width: '120px',
          fontSize: '9px',
          color: unlocked ? '#1a1a2e' : '#888',
          textAlign: 'center',
          fontWeight: '600',
          pointerEvents: 'none',
          userSelect: 'none',
          lineHeight: 1.3,
        }}
      >
        {unlocked ? card.text : '🔒 Inspect evidence to unlock'}
      </Html>
    </mesh>
  );
}
