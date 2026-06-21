import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { CHARACTERS } from '../data/debateRounds';
import scholarModel from '../assets/3D-models/scholar.glb?url';
import wizardModel from '../assets/3D-models/wizard.glb?url';

const MODEL_SETTINGS = {
  carnegie: {
    targetHeight: 2.5,
    modelPosition: [0, 0, 0],
    modelRotation: [0, Math.PI, 0],
    nameLabelPosition: [0, 4, 0],
    animation: 'Take 001',
    animationStartAt: 0.35,
    animationPaused: true,
    animationLoop: false,
  },
  mastery: {
    targetHeight: 2.5,
    modelPosition: [0, 0, 0],
    modelRotation: [0, Math.PI, 0],
    nameLabelPosition: [0.3, 0.35, 0],
  },
};

const DAMAGE_COLOR = '#ff3333';

function logModelMeshes(root, label) {
  const meshNames = [];
  root.traverse((child) => {
    if (child.isMesh) {
      meshNames.push(child.name || '(unnamed)');
    }
  });

  console.group(`[Character GLB] ${label} — ${meshNames.length} mesh(es)`);
  console.log('mesh names:', meshNames);
  root.traverse((child) => {
    if (!child.isMesh) return;
    console.log(child.name || '(unnamed)', {
      type: child.type,
      visible: child.visible,
      vertices: child.geometry?.attributes?.position?.count ?? 0,
      skinned: child.isSkinnedMesh,
    });
  });
  console.groupEnd();

  return meshNames;
}

function trackMaterial(material, materialEntries) {
  materialEntries.push({
    material,
    emissive: material.emissive?.clone?.() ?? new THREE.Color(),
    baseColor: material.color?.clone?.() ?? new THREE.Color('#ffffff'),
  });
  return material;
}

function makeVisibleMaterial(material, materialEntries) {
  const source = material.clone();

  if (source.opacity === 0) {
    return source;
  }

  if (source.map) {
    return trackMaterial(
      new THREE.MeshBasicMaterial({
        map: source.map,
        transparent: source.transparent,
        opacity: source.opacity,
        alphaTest: source.transparent ? 0.1 : 0,
        side: THREE.DoubleSide,
        toneMapped: false,
        depthWrite: !source.transparent,
        color: source.color?.clone?.() ?? new THREE.Color('#ffffff'),
      }),
      materialEntries
    );
  }

  const visibleMaterial = trackMaterial(source, materialEntries);
  visibleMaterial.side = THREE.DoubleSide;
  visibleMaterial.toneMapped = false;

  if (visibleMaterial.isMeshPhysicalMaterial || visibleMaterial.isMeshStandardMaterial) {
    visibleMaterial.metalness = 0;
    visibleMaterial.roughness = 1;
    visibleMaterial.envMapIntensity = 0;
  }

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

function shouldHideMesh(mesh) {
  if (mesh.name === 'pPlane1_BackGround_0') return true;

  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return materials.every((material) => material?.opacity === 0);
}

function centerOnGround(object) {
  const box = new THREE.Box3().setFromObject(object);
  object.position.set(
    -(box.min.x + box.max.x) / 2,
    -box.min.y,
    -(box.min.z + box.max.z) / 2
  );
}

function scaleSkinnedModel(model, factor) {
  const skeletons = new Set();

  model.traverse((child) => {
    if (!child.isSkinnedMesh) return;

    child.geometry = child.geometry.clone();
    child.geometry.scale(factor, factor, factor);
    child.geometry.computeBoundingBox();
    child.geometry.computeBoundingSphere();
    child.frustumCulled = false;
    skeletons.add(child.skeleton);
  });

  model.traverse((child) => {
    if (child.isBone) {
      child.position.multiplyScalar(factor);
    }
  });

  model.updateMatrixWorld(true);

  skeletons.forEach((skeleton) => {
    skeleton.calculateInverses();
    skeleton.update();
  });
}

function prepareScholarModel(scene, displayScale, settings) {
  const model = SkeletonUtils.clone(scene);
  const materialEntries = [];

  model.traverse((child) => {
    if (!child.isMesh) return;

    if (shouldHideMesh(child)) {
      child.visible = false;
      return;
    }

    child.frustumCulled = false;
    applyMaterial(child, materialEntries);
  });

  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const targetHeight = settings.targetHeight * displayScale;

  if (size.y > 0) {
    scaleSkinnedModel(model, targetHeight / size.y);
  }

  centerOnGround(model);
  model.position.x += settings.modelPosition[0];
  model.position.y += settings.modelPosition[1];
  model.position.z += settings.modelPosition[2];

  logModelMeshes(model, 'scholar.glb (prepared)');

  return { model, materialEntries };
}

function prepareWizardModel(scene, displayScale, settings) {
  const model = scene.clone(true);
  const materialEntries = [];
  const targetHeight = settings.targetHeight * displayScale;

  model.traverse((child) => {
    if (!child.isMesh) return;

    applyMaterial(child, materialEntries);
    child.frustumCulled = false;
  });

  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);

  if (size.y > 0) {
    model.scale.setScalar(targetHeight / size.y);
  }

  centerOnGround(model);
  model.position.x += settings.modelPosition[0];
  model.position.y += settings.modelPosition[1];
  model.position.z += settings.modelPosition[2];

  return { model, materialEntries };
}

function applyDamageFlash(materialEntries, flash, flashColor, tempColor) {
  materialEntries.forEach(({ material, emissive, baseColor }) => {
    if (flash > 0) {
      if (material.emissive) {
        tempColor.copy(emissive).lerp(flashColor, flash * 0.95);
        material.emissive.copy(tempColor).multiplyScalar(flash * 1.1);
      } else if (material.color) {
        tempColor.copy(baseColor).lerp(flashColor, flash * 0.92);
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
}

function ScholarCharacterModel({ damageRef, displayScale, settings }) {
  const { scene, animations } = useGLTF(scholarModel);
  const mixerRef = useRef(null);
  const flashColor = useMemo(() => new THREE.Color(DAMAGE_COLOR), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const { model, materialEntries } = useMemo(
    () => prepareScholarModel(scene, displayScale, settings),
    [scene, displayScale, settings]
  );

  useEffect(() => {
    logModelMeshes(scene, 'scholar.glb (raw load)');
    console.log('[Character GLB] animations:', animations);

    const mixer = new THREE.AnimationMixer(model);
    mixerRef.current = mixer;

    if (animations.length > 0) {
      const clipName = settings.animation ?? animations[0].name;
      const clip = animations.find((entry) => entry.name === clipName) ?? animations[0];
      const action = mixer.clipAction(clip, model);
      const startAt = settings.animationStartAt ?? 0;

      action.reset();
      action.setLoop(settings.animationLoop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
      action.clampWhenFinished = !settings.animationLoop;
      action.time = clip.duration * startAt;
      action.play();

      if (settings.animationPaused) {
        action.paused = true;
        mixer.update(0);
      }

      console.log('[Character GLB] playing animation:', clip.name);
    } else {
      console.warn('[Character GLB] no animations found on scholar.glb');
    }

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [
    animations,
    model,
    settings.animation,
    settings.animationLoop,
    settings.animationPaused,
    settings.animationStartAt,
  ]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
    applyDamageFlash(materialEntries, damageRef.current, flashColor, tempColor);
  });

  return (
    <group rotation={settings.modelRotation}>
      <primitive object={model} />
    </group>
  );
}

function WizardCharacterModel({ damageRef, displayScale, settings }) {
  const { scene } = useGLTF(wizardModel);
  const flashColor = useMemo(() => new THREE.Color(DAMAGE_COLOR), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const { model, materialEntries } = useMemo(
    () => prepareWizardModel(scene, displayScale, settings),
    [scene, displayScale, settings]
  );

  useFrame(() => {
    applyDamageFlash(materialEntries, damageRef.current, flashColor, tempColor);
  });

  return (
    <group rotation={settings.modelRotation}>
      <primitive object={model} />
    </group>
  );
}

function CharacterModel({ type, damageRef, displayScale }) {
  const settings = MODEL_SETTINGS[type] ?? MODEL_SETTINGS.mastery;

  if (type === 'carnegie') {
    return (
      <ScholarCharacterModel damageRef={damageRef} displayScale={displayScale} settings={settings} />
    );
  }

  return (
    <WizardCharacterModel damageRef={damageRef} displayScale={displayScale} settings={settings} />
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
  isUnderAttack = false,
  attackTrigger = 0,
  hitTrigger = 0,
}) {
  const groupRef = useRef();
  const entranceRef = useRef(0);
  const damageRef = useRef(0);
  const hitReactionRef = useRef(0);
  const character = CHARACTERS[type];
  const modelSettings = MODEL_SETTINGS[type] ?? MODEL_SETTINGS.mastery;
  const isSkinned = type === 'carnegie';

  useEffect(() => {
    if (isDramatic) entranceRef.current = 0;
  }, [isDramatic]);

  useEffect(() => {
    if (attackTrigger > 0) {
      damageRef.current = 1;
      hitReactionRef.current = 1;
    }
  }, [attackTrigger]);

  useEffect(() => {
    if (hitTrigger > 0) {
      damageRef.current = 1;
      hitReactionRef.current = Math.min(hitReactionRef.current + 0.45, 1);
    }
  }, [hitTrigger]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isUnderAttack) {
      damageRef.current = Math.max(damageRef.current, 0.72);
    }

    if (damageRef.current > 0) {
      damageRef.current = Math.max(0, damageRef.current - delta * (isUnderAttack ? 0.85 : 2.8));
    }

    if (hitReactionRef.current > 0) {
      hitReactionRef.current = Math.max(0, hitReactionRef.current - delta * 1.35);
    }

    if (isDramatic && entranceRef.current < 1) {
      entranceRef.current = Math.min(entranceRef.current + 0.015, 1);
    }

    const bob = Math.sin(state.clock.elapsedTime * 2) * (isDramatic ? 0.06 : 0.04);
    const reaction = hitReactionRef.current;
    const shakeX = Math.sin(state.clock.elapsedTime * 32) * reaction * 0.1;
    const shakeY = Math.sin(state.clock.elapsedTime * 24) * reaction * 0.06;
    const recoilZ = reaction * 0.22;
    const scaleBoost = isDramatic ? 1 + entranceRef.current * 0.05 : 1;
    const hitScale = 1 + reaction * 0.04;

    groupRef.current.position.set(
      position[0] + shakeX,
      position[1] + bob + shakeY,
      position[2] + recoilZ
    );
    groupRef.current.rotation.set(
      -reaction * 0.08,
      rotation?.[1] ?? 0,
      Math.sin(state.clock.elapsedTime * 26) * reaction * 0.05
    );

    if (!isSkinned) {
      groupRef.current.scale.setScalar(scale * scaleBoost * hitScale);
    } else {
      groupRef.current.scale.setScalar(hitScale);
    }
  });

  const labelY = modelSettings.targetHeight * scale + modelSettings.nameLabelPosition[1];
  const labelPosition = [
    modelSettings.nameLabelPosition[0],
    labelY,
    modelSettings.nameLabelPosition[2],
  ];

  return (
    <group ref={groupRef} position={position} rotation={rotation ?? [0, 0, 0]}>
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
