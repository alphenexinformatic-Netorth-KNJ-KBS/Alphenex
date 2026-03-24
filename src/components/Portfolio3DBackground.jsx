import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function FrameCard({ position, color, speed, rotAxis }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation[rotAxis || 'y'] = t * speed;
    meshRef.current.rotation.x = Math.sin(t * speed) * 0.2;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <planeGeometry args={[1.5, 2.2]} />
        <meshPhongMaterial
          color={color}
          transparent
          opacity={0.3}
          shininess={100}
          side={THREE.DoubleSide}
        />
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(1.5, 2.2)]} />
          <lineBasicMaterial color={color} transparent opacity={0.8} />
        </lineSegments>
      </mesh>
    </Float>
  );
}

function FloatingRings() {
  const count = 50;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      ref.current.rotation.z = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#0992C2" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1.5} />
      <pointLight position={[2, -2, 2]} intensity={1} color="#09c4f0" />
      
      <FloatingRings />
      <FrameCard position={[-3, 1, -2]} color="#0992C2" speed={0.2} rotAxis="y" />
      <FrameCard position={[3, -1, -3]} color="#4dc8f0" speed={-0.15} rotAxis="y" />
      <FrameCard position={[0, -2, 0]} color="#0773A0" speed={0.3} rotAxis="z" />
      <FrameCard position={[-1.5, -3, -4]} color="#065A80" speed={-0.2} rotAxis="x" />
      <FrameCard position={[2, 2, -1]} color="#09c4f0" speed={0.25} rotAxis="y" />
    </>
  );
}

function Portfolio3DBackground() {
  return (
    <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, #020c1b 0%, #051628 50%, #020c1b 100%)' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Portfolio3DBackground;
