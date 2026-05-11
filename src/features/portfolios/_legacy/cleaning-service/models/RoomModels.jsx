import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

const bedroomUrl  = new URL('../src/assets/low_poly_room4.glb', import.meta.url).href;
const kitchenUrl  = new URL('../src/assets/free_isometric_cafe4.glb', import.meta.url).href;
const bathroomUrl = new URL('../src/assets/cozy_blue_bathroom4.glb', import.meta.url).href;
const livingUrl   = new URL('../src/assets/isometric_room_house_game-ready_low_poly4.glb', import.meta.url).href;

const MODEL_PATHS = {
  bedroom: bedroomUrl,
  kitchen: kitchenUrl,
  bathroom: bathroomUrl,
  livingRoom: livingUrl,
};

const ROOM_SCALES = {
  bedroom: 0.8,
  kitchen: 0.8,
  bathroom: 0.8,
  livingRoom: 0.8,
};

export const RoomModel = ({ type, position = [0, 0, 0] }) => {
  const path = MODEL_PATHS[type];
  const { scene } = useGLTF(path);

  // for multiple of same type of room
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  useMemo(() => {
    clone.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    return clone;
  }, [clone]);

  const s = ROOM_SCALES[type] ?? 1;

  return <primitive object={clone} position={position} scale={[s, s, s]} />;
};

