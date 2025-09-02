import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';

import CleaningLady from '../models/CleaningLady';
import HouseModel from '../models/HouseModel';
import FamilyModel from '../models/FamilyModel';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

const models = [
  { key: 'cleaningLady', component: CleaningLady },
  { key: 'house', component: HouseModel },
  { key: 'family', component: FamilyModel },
];

const degToRad = (deg) => (deg * Math.PI) / 180;
const scrollSensitivity = 0.0005;
const maxVelocity = 0.5;

const modelSpecificScale = [2.2, 1.8, 0.6];
const modelY = [-2, 2.7, -2.0];
const modelZ = [2, -2, 2];

const normalize = (a) => ((a % 360) + 360) % 360;

export default function CleanAbout() {
  const rotation = useRef(0);
  const velocity = useRef(0);
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  const activeIdxRef = useRef(0);
  const [, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 520px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  // Scope wheel to the about section; DO NOT lock body or preventDefault
  const wrapRef = useRef(null);
  useEffect(() => {
    setMounted(true);
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < 10) return;
      velocity.current = clamp(velocity.current + e.deltaY * scrollSensitivity, -maxVelocity, maxVelocity);
      // no preventDefault → outer page can still scroll
    };
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Drag input (scoped to gesture layer)
  const drag = useRef({ active: false, lastX: 0 });
  const onPointerDown = (e) => {
    drag.current.active = true;
    drag.current.lastX = e.clientX;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    drag.current.lastX = e.clientX;
    velocity.current = clamp(-dx * 0.02, -maxVelocity, maxVelocity);
  };
  const onPointerUp = (e) => {
    drag.current.active = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  // Animate
  useEffect(() => {
    let raf;
    const step = () => {
      velocity.current *= 0.9;
      rotation.current = normalize(rotation.current + velocity.current * 10);

      let idx = Math.round(rotation.current / 120) % models.length;
      if (idx < 0) idx += models.length;
      if (idx !== activeIdxRef.current) {
        setActiveTextIndex(idx);
        activeIdxRef.current = idx;
      }

      setTick((t) => t + 1);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const currentRotation = rotation.current;

  const renderModel = (model, index) => {
    const radius = isMobile ? 3.4 : 6; // same values as before
    const xOffset = isMobile ? 0 : 2;

    let rel = normalize(index * 120 - currentRotation);
    const isFront = rel < 60 || rel > 300;
    if (!isFront) return null;

    let x = rel > 300 ? ((rel - 360) / 60) * -radius : (rel / 60) * radius;
    x += xOffset;

    const y = isMobile ? modelY[index] * 0.9 + 0.7 : modelY[index];
    const z = isMobile ? modelZ[index] * 0.9 : modelZ[index];

    const dist = Math.min(rel, 360 - rel);
    let s = easeInOut(1 - (dist / 60) * 0.2);
    s *= isMobile ? modelSpecificScale[index] * 0.82 : modelSpecificScale[index];

    const rotY = (rel > 300 ? -1 : 1) * degToRad((dist / 60) * 90);

    const Comp = model.component;
    return (
      <group key={model.key} position={[x, y, z]} scale={s} rotation-y={rotY}>
        <Comp rotation-y={rotY} />
      </group>
    );
  };

  const cameraProps = isMobile
    ? { position: [-1.2, 1.5, 9.2], fov: 55 }
    : { position: [-2, 1.5, 10], fov: 50 };

  return (
    <section className="clean-about-container">
      {mounted && (
        <motion.div ref={wrapRef} className="about-canvas-wrap" layout initial={false}>
          <Canvas dpr={[1, 2]} camera={cameraProps} style={{ height: '100vh', width: '100%' }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1} />
            <Environment preset="apartment" />
            <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
            <Suspense fallback={null}>{models.map(renderModel)}</Suspense>
          </Canvas>

          <div
            className="about-gesture-layer"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
        </motion.div>
      )}

      <div className={`about-overlay-text${isMobile ? ' mobile' : ''}`}>
        {["DOM's Cleaning – We bring sparkle to your space.",
          'From roof to floor – Every detail matters.',
          'For those I love – My purpose in every sweep.'][activeTextIndex]}
      </div>
    </section>
  );
}
