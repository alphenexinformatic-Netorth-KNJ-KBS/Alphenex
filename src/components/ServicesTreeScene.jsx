import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { servicesData } from './Services';

// Branch component representing an individual service
function ServiceBranch({ index, service, total, isActive, onSelect }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Calculate angle and position for the branch in a circle
  const angle = (index / total) * Math.PI * 2;
  const radius = 5.5; // Slightly larger for circular view
  const height = 0; // Keep all branches on same level for a circle
  
  const targetPos = new THREE.Vector3(
    Math.cos(angle) * radius,
    height,
    Math.sin(angle) * radius
  );

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(t + index) * 0.1;
      
      // Look at center
      groupRef.current.lookAt(0, 0, 0);
      
      // Pulse effect
      if (isActive || hovered) {
        const scale = 1.15 + Math.sin(t * 4) * 0.05;
        groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      } else {
        groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const color = service.highlight ? '#09c4f0' : '#0992C2';

  // Calculate next point in circle for connecting wire
  const nextAngle = ((index + 1) / total) * Math.PI * 2;
  const nextPos = new THREE.Vector3(
    Math.cos(nextAngle) * radius,
    0,
    Math.sin(nextAngle) * radius
  );

  return (
    <group ref={groupRef} position={[targetPos.x, targetPos.y, targetPos.z]}>
      {/* Wire connecting to center */}
      <mesh position={[-radius / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, radius, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>

      {/* Wire connecting to NEXT node in circle */}
      <group rotation={[0, -angle, 0]}>
         <mesh position={[radius * Math.sin(Math.PI/total), 0, -radius * (1-Math.cos(Math.PI/total))]} rotation={[0, Math.PI/2 + Math.PI/total, Math.PI/2]}>
            <cylinderGeometry args={[0.015, 0.015, radius * 2 * Math.sin(Math.PI/total), 8]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={0.5} 
              transparent 
              opacity={0.3} 
            />
         </mesh>
      </group>

      {/* Service Node */}
      <mesh 
        onClick={(e) => { e.stopPropagation(); onSelect(service.id); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhongMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={isActive || hovered ? 2 : 0.4}
          transparent
          opacity={0.9}
        />
      </mesh>

      <Html position={[0, 0.7, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div className={`px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all duration-300 ${isActive || hovered ? 'bg-[#09c4f0]/20 border-[#09c4f0] text-white shadow-[0_0_15px_rgba(9,196,240,0.5)] scale-110' : 'bg-black/40 border-white/10 text-gray-400'}`}>
          {service.title}
        </div>
      </Html>
    </group>
  );
}

// Central Trunk Component
function Trunk() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group>
      {/* Core Trunk */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.4, 0.8, 8, 32, 1, true]} />
        <meshStandardMaterial 
          color="#0992C2" 
          wireframe 
          transparent 
          opacity={0.2} 
          emissive="#09c4f0"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Central Glowing Energy Core */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={0.5}>
        <mesh>
          <icosahedronGeometry args={[0.8, 1]} />
          <meshStandardMaterial 
            color="#09c4f0" 
            emissive="#09c4f0" 
            emissiveIntensity={2} 
            wireframe
          />
        </mesh>
      </Float>

      {/* Ground Glow */}
      <mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4, 32]} />
        <meshBasicMaterial color="#09c4f0" transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

function Particles({ count = 100 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, [count]);

  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#09c4f0" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export default function ServicesTreeScene({ activeService, onServiceSelect }) {
  return (
    <div className="w-full h-[600px] md:h-[750px] relative">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={45} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#09c4f0" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0992C2" />
        <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={2} castShadow />

        <Suspense fallback={null}>
          <Trunk />
          <group rotation={[0, 0, 0]}>
            {servicesData.map((service, index) => (
              <ServiceBranch
                key={service.id}
                index={index}
                service={service}
                total={servicesData.length}
                isActive={activeService === service.id}
                onSelect={onServiceSelect}
              />
            ))}
          </group>
          <Particles />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Suspense>

        <OrbitControls 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={0.5} 
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>

      {/* Hint Overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none text-center">
        <p className="text-[#09c4f0]/60 text-sm font-medium tracking-widest uppercase animate-pulse">
          Rotate & Explore Our Ecosystem
        </p>
      </div>
    </div>
  );
}
