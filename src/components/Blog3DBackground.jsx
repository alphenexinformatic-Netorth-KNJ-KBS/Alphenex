import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function FloatingPaper({ position, color, speed, rotAxis }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation[rotAxis || 'y'] = t * speed;
    meshRef.current.rotation.x = t * speed * 0.3;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[1.6, 2.2, 0.05]} />
        <meshPhongMaterial
          color={color}
          transparent
          opacity={0.6}
          shininess={90}
          emissive={color}
          emissiveIntensity={0.2}
        />
        {/* Paper lines */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.6, 2.2, 0.05)]} />
          <lineBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </lineSegments>
      </mesh>
    </Float>
  );
}

function Stars() {
  const count = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#4dc8f0" transparent opacity={0.7} />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[0, 8, 4]} intensity={1.5} />
      <pointLight position={[3, -3, 3]} intensity={1} color="#0992C2" />
      
      <Stars />
      <FloatingPaper position={[-3, 1, -2]} color="#0992C2" speed={0.4} rotAxis="y" />
      <FloatingPaper position={[2.5, -1.5, -1]} color="#0773A0" speed={-0.3} rotAxis="z" />
      <FloatingPaper position={[0, 2, -4]} color="#09c4f0" speed={0.2} rotAxis="x" />
      <FloatingPaper position={[-2, -2, -3]} color="#065A80" speed={-0.5} rotAxis="y" />
      <FloatingPaper position={[4, 1.5, -3]} color="#4dc8f0" speed={0.35} rotAxis="z" />
    </>
  );
}

function Blog3DBackground() {
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

export default Blog3DBackground;
