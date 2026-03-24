import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Node({ position, color, speed }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * speed;
    meshRef.current.rotation.x = t * speed * 0.5;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshPhongMaterial
          color={color}
          transparent
          opacity={0.8}
          shininess={100}
          emissive={color}
          emissiveIntensity={0.3}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function GridLines() {
  const count = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);

  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#0992C2" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 4]} intensity={1.0} />
      <pointLight position={[-4, 2, 3]} intensity={0.7} color="#0992C2" />
      
      <GridLines />
      <Node position={[-3, 1.5, -1]} color="#0992C2" speed={0.4} />
      <Node position={[3.5, -1.5, -2]} color="#4dc8f0" speed={0.3} />
      <Node position={[-2.5, -2, 1]} color="#0773A0" speed={0.5} />
      <Node position={[2.5, 2, 0]} color="#065A80" speed={0.35} />
      <Node position={[0, 0, -3]} color="#09c4f0" speed={0.2} />
    </>
  );
}

function Services3DBackground() {
  return (
    <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, #020c1b 0%, #051628 50%, #020c1b 100%)' }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Services3DBackground;
