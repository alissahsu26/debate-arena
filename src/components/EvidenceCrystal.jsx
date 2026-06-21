import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const COLORS = {
  default: '#00E5FF',
  inspected: '#76FF03',
};

export default function EvidenceCrystal({ id, position, inspected, onInspect, active }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.025;
    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.12;
  });

  if (!active) return null;

  const color = inspected ? COLORS.inspected : COLORS.default;

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
    </group>
  );
}
