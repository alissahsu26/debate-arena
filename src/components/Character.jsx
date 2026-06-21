import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { CHARACTERS } from '../data/debateRounds';
import scholarModel from '../assets/3D-models/scholar.glb?url';
import wizardModel from '../assets/3D-models/wizard.glb?url';

const MODEL_CONFIG = {
  carnegie: { url: scholarModel, facingY: Math.PI },
  mastery: { url: wizardModel, facingY: Math.PI },
};

const TARGET_HEIGHT = 2.5;
const LABEL_OFFSET = 0.35;

useGLTF.preload(scholarModel);
useGLTF.preload(wizardModel);

function getMeshBounds(root) {
  const box = new THREE.Box3();
  const temp = new THREE.Box3();
  root.traverse((child) => {
    if (child.isMesh) {
      temp.setFromObject(child);
      if (!temp.isEmpty()) box.union(temp);
    }
  });
  return box;
}

function prepareModel(scene) {
  const clone = scene.clone(true);
  const box = getMeshBounds(clone);

  if (box.isEmpty()) return { object: clone, height: TARGET_HEIGHT };

  const size = new THREE.Vector3();
  box.getSize(size);
  const height = size.y || TARGET_HEIGHT;
  const scale = TARGET_HEIGHT / height;
  clone.scale.setScalar(scale);

  const scaledBox = getMeshBounds(clone);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);
  clone.position.set(-center.x, -scaledBox.min.y, -center.z);

  clone.traverse((child) => {
    if (!child.isMesh) return;
    child.frustumCulled = false;
    child.castShadow = true;
    child.receiveShadow = true;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((mat) => {
      if (!mat) return;
      mat.side = THREE.DoubleSide;
      if (mat.emissive) {
        mat.emissive = new THREE.Color(0x333344);
        mat.emissiveIntensity = 0.35;
      }
    });
  });

  return { object: clone, height: TARGET_HEIGHT };
}

function CharacterModel({ type }) {
  const { scene } = useGLTF(MODEL_CONFIG[type].url);
  const { object, facingY } = useMemo(() => {
    const prepared = prepareModel(scene);
    return { object: prepared.object, facingY: MODEL_CONFIG[type].facingY };
  }, [scene, type]);

  return (
    <group rotation={[0, facingY, 0]}>
      <primitive object={object} />
    </group>
  );
}

export default function Character({
  type,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  isPlayer = false,
  isDramatic = false,
}) {
  const groupRef = useRef();
  const entranceRef = useRef(0);
  const character = CHARACTERS[type];

  useEffect(() => {
    if (isDramatic) entranceRef.current = 0;
  }, [isDramatic]);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (isDramatic && entranceRef.current < 1) {
      entranceRef.current = Math.min(entranceRef.current + 0.015, 1);
    }
    const bob = Math.sin(state.clock.elapsedTime * 2) * (isDramatic ? 0.08 : 0.05);
    const scaleBoost = isDramatic ? 1 + entranceRef.current * 0.06 : 1;
    groupRef.current.position.set(position[0], position[1] + bob, position[2]);
    groupRef.current.scale.setScalar(scale * scaleBoost);
  });

  const labelY = TARGET_HEIGHT + LABEL_OFFSET;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <CharacterModel type={type} />

      <pointLight
        position={[0, 2.2, 1.2]}
        intensity={isDramatic ? 4 : 2.5}
        color="#ffffff"
        distance={10}
      />
      {isDramatic && (
        <pointLight
          position={[0, 2, 0.5]}
          intensity={3}
          color={character.color}
          distance={10}
        />
      )}

      <Html
        center
        distanceFactor={6}
        position={[0, labelY, 0]}
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
