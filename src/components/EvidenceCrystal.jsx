import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const COLORS = {
  default: '#00E5FF',
  inspected: '#76FF03',
};

const CATEGORY_COLORS = {
  'District Data': '#4A90D9',
  'Teacher Perspectives': '#9B59B6',
  'Academic Research': '#FF9800',
};

export default function EvidenceCrystal({ id, evidence, position, inspected, onInspect, active }) {
  const groupRef = useRef();
  const spawnRef = useRef(0);

  useFrame((state) => {
    if (!groupRef.current) return;
    spawnRef.current = Math.min(spawnRef.current + 0.02, 1);
    groupRef.current.rotation.y += 0.025;
    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.12;
    groupRef.current.scale.setScalar(spawnRef.current);
  });

  if (!active) return null;

  const color = inspected ? COLORS.inspected : CATEGORY_COLORS[evidence?.category] || COLORS.default;

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]} frustumCulled={false}>
      <mesh
        frustumCulled={false}
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
        <octahedronGeometry args={[0.55, 0]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh frustumCulled={false} scale={1.25}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <mesh frustumCulled={false} scale={1.6}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={4} distance={6} decay={1} />

      {inspected && evidence && (
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
