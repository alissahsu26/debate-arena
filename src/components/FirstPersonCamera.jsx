import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

const CAMERA_HEIGHT = 1.55;
const CAMERA_Z = 0.5;

export default function FirstPersonCamera({ opponentPosition = [0, 0, -4.2], lookY = 1.5 }) {
  const cameraPos = useMemo(() => new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_Z), []);
  const lookTarget = useMemo(
    () => new THREE.Vector3(opponentPosition[0], lookY, opponentPosition[2]),
    [opponentPosition, lookY]
  );

  useFrame(({ camera }) => {
    camera.position.copy(cameraPos);
    camera.lookAt(lookTarget);
  });

  return null;
}
