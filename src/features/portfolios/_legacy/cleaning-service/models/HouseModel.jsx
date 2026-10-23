import React, { memo } from 'react';
import { useGLTF } from '@react-three/drei';

const modelUrl = new URL('../src/assets/low_poly_isometric_rooms3.glb', import.meta.url).href;
useGLTF.preload(modelUrl);

const HouseModel = (props) => {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} scale={0.5} position={[0, -1.5, 0]} {...props} />;
};

export default memo(HouseModel);
