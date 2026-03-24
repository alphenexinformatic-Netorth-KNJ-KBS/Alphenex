import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

function Hexagon({ position, color, speed, scale }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * speed;
    meshRef.current.rotation.z = t * speed * 0.5;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <cylinderGeometry args={[1, 1, 0.2, 6]} />
        <meshPhongMaterial
          color={color}
          transparent
          opacity={0.6}
          shininess={80}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
    </Float>
  );
}

function Dust() {
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#09c4f0" transparent opacity={0.8} />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 5, 2]} intensity={1.2} />
      <pointLight position={[-2, -2, 2]} intensity={1} color="#0992C2" />
      
      <Dust />
      <Hexagon position={[-3, 2, -2]} color="#0992C2" speed={0.3} scale={1} />
      <Hexagon position={[3, -1, -1]} color="#4dc8f0" speed={-0.4} scale={1.2} />
      <Hexagon position={[1, 3, -4]} color="#0773A0" speed={0.2} scale={0.8} />
      <Hexagon position={[-4, -2, -3]} color="#065A80" speed={0.5} scale={1.5} />
      <Hexagon position={[0, -3, -2]} color="#09c4f0" speed={-0.3} scale={0.9} />
    </>
  );
}

function Contact3DBackground() {
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

export default Contact3DBackground;
