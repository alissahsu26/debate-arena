import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const COLORS = {
  default: '#00E5FF',
  inspected: '#76FF03',
};

export default function EvidenceCrystal({ id, position, inspected, onInspect, active }) {
  const meshRef = useRef();
  const baseY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.012;
    meshRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.15;
  });

  if (!active) return null;

  const color = inspected ? COLORS.inspected : COLORS.default;

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (!inspected) onInspect(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = inspected ? 'default' : 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      {/* TODO: particle burst on inspect, SFX hook */}
      <octahedronGeometry args={[0.45, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={inspected ? 1.2 : 0.6}
        transparent
        opacity={inspected ? 0.85 : 1}
      />
      <pointLight color={color} intensity={inspected ? 0.8 : 0.4} distance={3} />
    </mesh>
  );
}
