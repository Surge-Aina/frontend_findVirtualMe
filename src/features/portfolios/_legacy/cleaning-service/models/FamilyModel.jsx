import React, { memo } from 'react';
import { useGLTF } from '@react-three/drei';

const modelUrl = new URL('../src/assets/rp_fabienne_percy_posed_001_60k.glb', import.meta.url).href;
useGLTF.preload(modelUrl);

const FamilyModel = (props) => {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} scale={5} {...props} />;
};

export default memo(FamilyModel);
