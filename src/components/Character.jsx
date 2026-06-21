import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { CHARACTERS } from '../data/debateRounds';
import scholarModel from '../assets/3D-models/scholar.glb?url';
import wizardModel from '../assets/3D-models/wizard.glb?url';

const CHARACTER_MODELS = {
  carnegie: scholarModel,
  mastery: wizardModel,
};

// Per-model tuning (carnegie = scholar.glb, mastery = wizard.glb)
const MODEL_SETTINGS = {
  carnegie: {
    targetHeight: 2.5,
    modelPosition: [0, 0, 0],
    modelRotation: [0, Math.PI, 0],
    nameLabelPosition: [0, 0.35, 0],
  },
  mastery: {
    targetHeight: 2.5,
    modelPosition: [0, 0, 0],
    modelRotation: [0, Math.PI, 0],
    nameLabelPosition: [0.3, 0.35, 0],
  },
};

const DAMAGE_COLOR = '#ff3333';

function hasSkinnedMesh(object) {
  let found = false;
  object.traverse((child) => {
    if (child.isSkinnedMesh) found = true;
  });
  return found;
}

function makeVisibleMaterial(material, materialEntries) {
  const source = material.clone();

  if (source.opacity === 0) {
    return source;
  }

  let visibleMaterial = source;

  if (source.map) {
    visibleMaterial = new THREE.MeshBasicMaterial({
      map: source.map,
      transparent: source.transparent,
      opacity: source.opacity,
      alphaTest: source.alphaTest ?? 0.01,
      side: source.side,
      toneMapped: false,
      color: source.color?.clone?.() ?? new THREE.Color('#ffffff'),
    });
  } else if (source.isMeshBasicMaterial) {
    visibleMaterial.toneMapped = false;
  } else {
    visibleMaterial.toneMapped = false;
    visibleMaterial.metalness = 0;
    visibleMaterial.roughness = 1;
    visibleMaterial.envMapIntensity = 0;
  }

  materialEntries.push({
    material: visibleMaterial,
    emissive: visibleMaterial.emissive?.clone?.() ?? new THREE.Color(),
    baseColor: visibleMaterial.color?.clone?.() ?? new THREE.Color('#ffffff'),
  });

  return visibleMaterial;
}

function applyMaterial(mesh, materialEntries) {
  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map((material) => makeVisibleMaterial(material, materialEntries));
    return;
  }

  if (mesh.material) {
    mesh.material = makeVisibleMaterial(mesh.material, materialEntries);
  }
}

function centerOnGround(object) {
  const box = new THREE.Box3().setFromObject(object);
  object.position.set(
    -(box.min.x + box.max.x) / 2,
    -box.min.y,
    -(box.min.z + box.max.z) / 2
  );
}

function scaleObjectUniform(object, factor) {
  if (hasSkinnedMesh(object)) {
    object.traverse((child) => {
      if (child.isBone) {
        child.position.multiplyScalar(factor);
      }
    });
    object.updateMatrixWorld(true);
    return;
  }

  object.scale.setScalar(factor);
}

function prepareModel(scene, displayScale, type) {
  const settings = MODEL_SETTINGS[type] ?? MODEL_SETTINGS.mastery;
  const model = hasSkinnedMesh(scene) ? SkeletonUtils.clone(scene) : scene.clone(true);
  const materialEntries = [];
  const targetHeight = settings.targetHeight * displayScale;

  model.traverse((child) => {
    if (!child.isMesh) return;

    applyMaterial(child, materialEntries);

    if (child.material?.opacity === 0 || (Array.isArray(child.material) && child.material.every((m) => m.opacity === 0))) {
      child.visible = false;
      return;
    }

    if (child.isSkinnedMesh) {
      child.frustumCulled = false;
    }
  });

  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);

  if (size.y > 0) {
    scaleObjectUniform(model, targetHeight / size.y);
  }

  centerOnGround(model);
  model.position.x += settings.modelPosition[0];
  model.position.y += settings.modelPosition[1];
  model.position.z += settings.modelPosition[2];

  return {
    model,
    materialEntries,
    isSkinned: hasSkinnedMesh(model),
    settings,
  };
}

function CharacterModel({ type, damageRef, displayScale }) {
  const { scene } = useGLTF(CHARACTER_MODELS[type]);
  const flashColor = useMemo(() => new THREE.Color(DAMAGE_COLOR), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const { model, materialEntries, settings } = useMemo(
    () => prepareModel(scene, displayScale, type),
    [scene, displayScale, type]
  );

  useFrame(() => {
    const flash = damageRef.current;
    materialEntries.forEach(({ material, emissive, baseColor }) => {
      if (flash > 0) {
        if (material.emissive) {
          tempColor.copy(emissive).lerp(flashColor, flash * 0.85);
          material.emissive.copy(tempColor).multiplyScalar(flash * 0.75);
        } else if (material.color) {
          tempColor.copy(baseColor).lerp(flashColor, flash * 0.85);
          material.color.copy(tempColor);
        }
        return;
      }

      if (material.emissive) {
        material.emissive.copy(emissive);
      }
      if (material.color) {
        material.color.copy(baseColor);
      }
    });
  });

  return (
    <group rotation={settings.modelRotation}>
      <primitive object={model} />
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
  const modelSettings = MODEL_SETTINGS[type] ?? MODEL_SETTINGS.mastery;
  const isSkinned = type === 'carnegie';

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

    // Skinned GLB rigs break when their parent group is scaled.
    if (!isSkinned) {
      groupRef.current.scale.setScalar(scale * scaleBoost);
    } else {
      groupRef.current.scale.setScalar(1);
    }
  });

  const labelY = modelSettings.targetHeight * scale + modelSettings.nameLabelPosition[1];
  const labelPosition = [
    modelSettings.nameLabelPosition[0],
    labelY,
    modelSettings.nameLabelPosition[2],
  ];

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <CharacterModel type={type} damageRef={damageRef} displayScale={scale} />

      <pointLight position={[0, 2.5, 2]} intensity={3} color="#ffffff" distance={14} />

      {showNameLabel && (
        <Html
          center
          distanceFactor={6}
          position={labelPosition}
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
      )}
    </group>
  );
}

useGLTF.preload(scholarModel);
useGLTF.preload(wizardModel);

export default function Character(props) {
  return <CharacterInner {...props} />;
}
