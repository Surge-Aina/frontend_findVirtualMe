import React, { memo } from 'react';
import { useGLTF } from '@react-three/drei';


const modelUrl = new URL('../src/assets/rp_posed_00178_29.glb', import.meta.url).href;
useGLTF.preload(modelUrl);

const CleaningLady = (props) => {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} scale={15.2} {...props} />;
};

export default memo(CleaningLady);
