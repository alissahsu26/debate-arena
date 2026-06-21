import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { CHARACTERS } from '../data/debateRounds';

const HEAD_HEIGHT = 2.05;
const NAME_LABEL_OFFSET = 0.7;
const DAMAGE_COLOR = '#ff3333';

function CharacterModel({ type, damageRef }) {
  const character = CHARACTERS[type];
  const materialRefs = useRef([]);

  const parts = useMemo(() => {
    const color = character.color;
    const shared = [
      { geometry: 'capsule', args: [0.45, 1.2, 4, 12], position: [0, 0.9, 0], color },
      { geometry: 'sphere', args: [0.42, 16, 16], position: [0, 2.05, 0], color },
    ];

    if (type === 'carnegie') {
      return [
        ...shared,
        {
          geometry: 'cone',
          args: [0.12, 0.35, 4],
          position: [-0.35, 2.35, 0.05],
          rotation: [0, 0, -0.4],
          color,
        },
        {
          geometry: 'cone',
          args: [0.12, 0.35, 4],
          position: [0.35, 2.35, 0.05],
          rotation: [0, 0, 0.4],
          color,
        },
        {
          geometry: 'box',
          args: [0.5, 0.08, 0.08],
          position: [0, 2.15, 0.38],
          color: '#222222',
        },
      ];
    }

    return [
      ...shared,
      {
        geometry: 'cone',
        args: [0.25, 0.55, 8],
        position: [0, 2.55, 0],
        color: '#4a0080',
      },
      {
        geometry: 'box',
        args: [0.12, 0.7, 0.12],
        position: [0.55, 1.1, 0],
        rotation: [0, 0, -0.5],
        color: '#228822',
      },
    ];
  }, [character.color, type]);

  const baseColors = useMemo(
    () => parts.map((part) => new THREE.Color(part.color)),
    [parts]
  );
  const flashColor = useMemo(() => new THREE.Color(DAMAGE_COLOR), []);
  const currentColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const flash = damageRef.current;
    materialRefs.current.forEach((material, index) => {
      if (!material) return;
      currentColor.copy(baseColors[index]).lerp(flashColor, flash);
      material.color.copy(currentColor);
    });
  });

  return (
    <group rotation={[0, Math.PI, 0]}>
      {parts.map((part, index) => (
        <mesh
          key={index}
          position={part.position}
          rotation={part.rotation || [0, 0, 0]}
        >
          {part.geometry === 'capsule' && <capsuleGeometry args={part.args} />}
          {part.geometry === 'sphere' && <sphereGeometry args={part.args} />}
          {part.geometry === 'cone' && <coneGeometry args={part.args} />}
          {part.geometry === 'box' && <boxGeometry args={part.args} />}
          <meshBasicMaterial
            ref={(material) => {
              materialRefs.current[index] = material;
            }}
            color={part.color}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function CharacterInner({
  type,
  position,
  rotation,
  scale,
  isPlayer,
  isDramatic,
  showNameLabel = true,
  hitTrigger = 0,
}) {
  const groupRef = useRef();
  const entranceRef = useRef(0);
  const damageRef = useRef(0);
  const character = CHARACTERS[type];

  useEffect(() => {
    if (isDramatic) entranceRef.current = 0;
  }, [isDramatic]);

  useEffect(() => {
    if (hitTrigger > 0) damageRef.current = 1;
  }, [hitTrigger]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (damageRef.current > 0) {
      damageRef.current = Math.max(0, damageRef.current - delta * 2.8);
    }

    if (isDramatic && entranceRef.current < 1) {
      entranceRef.current = Math.min(entranceRef.current + 0.015, 1);
    }
    const bob = Math.sin(state.clock.elapsedTime * 2) * (isDramatic ? 0.06 : 0.04);
    const scaleBoost = isDramatic ? 1 + entranceRef.current * 0.05 : 1;
    groupRef.current.position.set(position[0], position[1] + bob, position[2]);
    groupRef.current.scale.setScalar(scale * scaleBoost);
  });

  const labelY = HEAD_HEIGHT + NAME_LABEL_OFFSET;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <CharacterModel type={type} damageRef={damageRef} />

      <pointLight position={[0, 2.5, 2]} intensity={3} color="#ffffff" distance={14} />

      <Html
        center
        distanceFactor={6}
        position={[0, labelY, 0]}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div className={`pkmn-name-bar pkmn-name-bar--${type}`}>
          <div className="pkmn-name-bar-stripe" aria-hidden="true" />
          <div className="pkmn-name-bar-body">
            <span className="pkmn-name-bar-name">{character.label}</span>
            <span className="pkmn-name-bar-side">{character.side}</span>
            {isPlayer && <span className="pkmn-name-bar-you">YOU</span>}
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function Character(props) {
  return <CharacterInner {...props} />;
}
