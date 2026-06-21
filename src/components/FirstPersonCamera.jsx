import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const EYE = new THREE.Vector3(0, 1.55, 0.8);
const LOOK = new THREE.Vector3(0, 1.25, -3.5);

export default function FirstPersonCamera() {
  useFrame(({ camera }) => {
    camera.position.copy(EYE);
    camera.lookAt(LOOK);
  });

  return null;
}
