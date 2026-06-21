import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

const CAMERA_HEIGHT = 1.55;
const CAMERA_Z = 0.5;

export default function FirstPersonCamera({ opponentPosition = [0, 0, -4.2] }) {
  const cameraPos = useMemo(() => new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_Z), []);
  const lookTarget = useMemo(
    () => new THREE.Vector3(opponentPosition[0], 1.5, opponentPosition[2]),
    [opponentPosition]
  );

  useFrame(({ camera }) => {
    camera.position.copy(cameraPos);
    camera.lookAt(lookTarget);
  });

  return null;
}
