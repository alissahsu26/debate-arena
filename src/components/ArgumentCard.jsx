import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const FACE_CAMERA_Y = Math.PI;
const DRAG_SENSITIVITY = 0.004;

export default function ArgumentCard({
  card,
  position,
  targetPosition,
  isThrowing,
  throwPower = 1,
  onThrowAim,
  onThrowComplete,
  active,
}) {
  const meshRef = useRef();
  const progressRef = useRef(0);
  const [localThrowing, setLocalThrowing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const aimRef = useRef({ x: 0, y: 0 });
  const startPos = useRef(new THREE.Vector3(...position));
  const endPos = useRef(new THREE.Vector3(...(targetPosition || [0, 1.6, -7.5])));

  useEffect(() => {
    endPos.current.set(...(targetPosition || [0, 1.6, -7.5]));
  }, [targetPosition]);

  useEffect(() => {
    if (isThrowing) {
      setLocalThrowing(true);
      progressRef.current = 0;
      startPos.current.set(meshRef.current?.position.x ?? position[0], meshRef.current?.position.y ?? position[1], meshRef.current?.position.z ?? position[2]);
      endPos.current.set(...(targetPosition || [0, 1.6, -7.5]));
    }
  }, [isThrowing, position, targetPosition]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (localThrowing) {
      const speed = 1.2 + throwPower * 0.8;
      progressRef.current = Math.min(progressRef.current + delta * speed, 1);
      const t = progressRef.current;
      const arcHeight = (1.5 + throwPower * 1.2) * Math.sin(t * Math.PI);
      meshRef.current.position.lerpVectors(startPos.current, endPos.current, t);
      meshRef.current.position.y =
        THREE.MathUtils.lerp(startPos.current.y, endPos.current.y, t) + arcHeight;
      meshRef.current.rotation.y = FACE_CAMERA_Y + t * Math.PI * 2;

      if (t >= 1) {
        setLocalThrowing(false);
        onThrowComplete(card);
      }
    } else if (!dragging) {
      const baseX = position[0] + aimRef.current.x * 0.5;
      const baseY = position[1] + aimRef.current.y * 0.3;
      meshRef.current.position.set(baseX, baseY, position[2]);
      meshRef.current.rotation.set(0, FACE_CAMERA_Y + Math.sin(Date.now() * 0.001) * 0.08, 0);
    }
  });

  if (!active) return null;

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (localThrowing || isThrowing) return;
    setDragging(true);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    e.stopPropagation();
    aimRef.current.x = THREE.MathUtils.clamp(aimRef.current.x + e.movementX * DRAG_SENSITIVITY, -1, 1);
    aimRef.current.y = THREE.MathUtils.clamp(aimRef.current.y - e.movementY * DRAG_SENSITIVITY, -0.5, 0.5);
    onThrowAim?.({ x: aimRef.current.x, y: aimRef.current.y });
    if (meshRef.current) {
      meshRef.current.position.x = position[0] + aimRef.current.x * 0.5;
      meshRef.current.position.y = position[1] + aimRef.current.y * 0.3;
    }
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    e.stopPropagation();
    setDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        rotation={[0, FACE_CAMERA_Y, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!localThrowing && !isThrowing) document.body.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <planeGeometry args={[1.6, 1]} />
        <meshBasicMaterial color="#FFD54F" transparent opacity={0.95} side={THREE.FrontSide} />
        <Html
          center
          transform
          occlude={false}
          distanceFactor={4}
          style={{
            width: '140px',
            fontSize: '10px',
            color: '#1a1a2e',
            textAlign: 'center',
            fontWeight: '600',
            pointerEvents: 'none',
            userSelect: 'none',
            lineHeight: 1.3,
          }}
        >
          {card.text}
        </Html>
      </mesh>
    </group>
  );
}
