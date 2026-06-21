import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Plane default normal is +Z; rotate so front face points toward POV camera (-Z)
const FACE_CAMERA_Y = Math.PI;

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
  const endPos = useRef(new THREE.Vector3(...(targetPosition || [0, 1.6, 3])));

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
      meshRef.current.rotation.y = FACE_CAMERA_Y + t * Math.PI * 2;

      if (t >= 1) {
        setLocalThrowing(false);
        onThrowComplete(card);
      }
    } else {
      meshRef.current.position.set(...position);
      meshRef.current.rotation.set(0, FACE_CAMERA_Y + Math.sin(Date.now() * 0.001) * 0.08, 0);
    }
  });

  if (!active) return null;

  const canClick = unlocked && !localThrowing && !isThrowing;

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[0, FACE_CAMERA_Y, 0]}
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
      <planeGeometry args={[1.6, 1]} />
      <meshBasicMaterial
        color={unlocked ? '#FFD54F' : '#555555'}
        transparent
        opacity={unlocked ? 0.95 : 0.35}
        side={THREE.FrontSide}
      />
      <Html
        center
        transform
        occlude={false}
        distanceFactor={4}
        style={{
          width: '140px',
          fontSize: '10px',
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
