import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Individual funnel stage
function FunnelStage({ position, topRadius, bottomRadius, height, color, label, sublabel, index, isActive, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.y = t * 0.15 + index * 0.5;
      if (isActive || hovered) {
        meshRef.current.scale.setScalar(1.05 + Math.sin(t * 3) * 0.02);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const geometry = useMemo(() => {
    return new THREE.CylinderGeometry(bottomRadius, topRadius, height, 64, 1, false);
  }, [topRadius, bottomRadius, height]);

  const material = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: hovered || isActive ? 0.92 : 0.78,
      shininess: 120,
      specular: new THREE.Color('#ffffff'),
      emissive: new THREE.Color(color).multiplyScalar(isActive ? 0.4 : hovered ? 0.25 : 0.1),
      side: THREE.DoubleSide,
    });
  }, [color, hovered, isActive]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        onClick={(e) => { e.stopPropagation(); onClick(index); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        castShadow
        receiveShadow
      />

      {/* Rim edge ring */}
      <mesh position={[0, height / 2 + 0.01, 0]}>
        <torusGeometry args={[bottomRadius, 0.04, 16, 64]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>

      {/* HTML label */}
      <Html
        position={[topRadius + 1.2, 0, 0]}
        center={false}
        distanceFactor={8}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          background: isActive
            ? `linear-gradient(135deg, ${color}cc, ${color}88)`
            : 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(8px)',
          border: `1.5px solid ${isActive ? color : 'rgba(255,255,255,0.15)'}`,
          borderRadius: '12px',
          padding: '10px 16px',
          minWidth: '160px',
          boxShadow: isActive ? `0 0 24px ${color}66` : '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
          transform: 'translateX(10px)',
        }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '3px', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {label}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', lineHeight: 1.4 }}>
            {sublabel}
          </div>
        </div>
      </Html>
    </group>
  );
}

// Floating particles
function Particles({ count = 60 }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, [count]);

  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#4dc8f0" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// Flowing arrows between stages
function FlowArrow({ fromY, toY }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.material.opacity = 0.3 + Math.sin(t * 2) * 0.2;
    }
  });
  return (
    <mesh ref={ref} position={[0, (fromY + toY) / 2, 0]}>
      <cylinderGeometry args={[0.02, 0.02, Math.abs(fromY - toY) * 0.3, 8]} />
      <meshBasicMaterial color="#09c4f0" transparent opacity={0.5} />
    </mesh>
  );
}

// Main funnel scene content
function FunnelContent({ activeStage, setActiveStage }) {
  const funnelStages = [
    {
      topRadius: 3.2,
      bottomRadius: 2.6,
      height: 1.6,
      color: '#0992C2',
      label: '🤖 AI Automation & SaaS',
      sublabel: 'Custom AI post automation, sales systems, and AI receptionists (Netorth.ae).',
      yPos: 3.5,
    },
    {
      topRadius: 2.6,
      bottomRadius: 2.0,
      height: 1.6,
      color: '#0773A0',
      label: '🎯 Precision Targeting',
      sublabel: 'High-ticket lead gen for Real Estate, Dental, Roofing in USA/UAE.',
      yPos: 1.7,
    },
    {
      topRadius: 2.0,
      bottomRadius: 1.4,
      height: 1.6,
      color: '#065A80',
      label: '🚀 10X Revenue Roadmap',
      sublabel: 'Straightforward business solutions and budget optimization.',
      yPos: -0.1,
    },
    {
      topRadius: 1.4,
      bottomRadius: 0.8,
      height: 1.6,
      color: '#044060',
      label: '🏢 SaaS Ecosystem',
      sublabel: 'Employee, payroll & holiday management to optimize costs.',
      yPos: -1.9,
    },
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[8, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-8, 5, -5]} intensity={0.5} color="#09c4f0" />
      <pointLight position={[0, 6, 0]} intensity={0.8} color="#0992C2" />
      <pointLight position={[0, -4, 2]} intensity={0.5} color="#4dc8f0" />

      <Particles />

      {funnelStages.map((stage, i) => (
        <FunnelStage
          key={i}
          index={i}
          position={[0, stage.yPos, 0]}
          topRadius={stage.topRadius}
          bottomRadius={stage.bottomRadius}
          height={stage.height}
          color={stage.color}
          label={stage.label}
          sublabel={stage.sublabel}
          isActive={activeStage === i}
          onClick={setActiveStage}
        />
      ))}

      {/* Center glow at bottom */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
        <mesh position={[0, -2.8, 0]}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshPhongMaterial color="#09c4f0" emissive="#09c4f0" emissiveIntensity={1.5} />
        </mesh>
      </Float>

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 0.8}
        minDistance={8}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </>
  );
}

// Stage info panel
const stageInfo = [
  {
    icon: '🤖',
    title: 'AI & SaaS Automation',
    color: '#0992C2',
    description: 'We integrate custom AI solutions to handle your operations. From AI receptionists (via Netorth.ae) that manage 24/7 calls to automated social media posting, we reduce your overhead while increasing efficiency.',
    metrics: ['AI Receptionists', '24/7 Call Handling', 'Auto-Post AI Systems'],
  },
  {
    icon: '🎯',
    title: 'Precision High-Ticket Targeting',
    color: '#0773A0',
    description: 'We specialize in high-ticket niches like Real Estate, Dental, and Roofing. Our multi-channel global campaigns (USA, UAE, AUS) are engineered to find decision-makers with high-intent budgets.',
    metrics: ['Real Estate / Dental / Roofing', 'Global High-Ticket Reach', 'High-Intent Lead Gen'],
  },
  {
    icon: '🚀',
    title: '10X Business Roadmap',
    color: '#065A80',
    description: 'Our straight-forward roadmap optimizes your monthly budget and identifies growth bottlenecks. We focus on business solutions that scale your revenue 10X through proven sales architecture.',
    metrics: ['Budget Optimization', 'Growth Bottleneck Identification', 'Sales Architecture'],
  },
  {
    icon: '🏢',
    title: 'Enterprise SaaS Ecosystem',
    color: '#044060',
    description: 'Beyond marketing, we build SaaS products to help businesses optimize costs. Manage employees, payroll, and holidays through a centralized dashboard, identifying and solving operational pain points.',
    metrics: ['Employee Management', 'Cost Optimization SaaS', 'Painpoint-Driven Solutions'],
  },
];

function FunnelScene() {
  const [activeStage, setActiveStage] = useState(null);

  const handleStageClick = (index) => {
    setActiveStage(prev => (prev === index ? null : index));
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#020c1b] via-[#051628] to-[#020c1b] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(9,146,194,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(9,146,194,0.4) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(9,146,194,0.12) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#09c4f0] font-semibold tracking-wider uppercase text-sm mb-3 block">
            Business Growth Architecture
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The 10X{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0992C2] to-[#09c4f0]">
              Sales & SaaS Funnel
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Our straightforward solution integrates AI automation and SaaS products to optimize your budget and scale your business.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-center mb-12">
          {/* 3D Canvas - Main View */}
          <div
            className="relative lg:col-span-7 rounded-2xl overflow-hidden"
            style={{
              height: '650px',
              background: 'linear-gradient(135deg, rgba(5,22,40,0.8), rgba(2,12,27,0.9))',
              border: '1px solid rgba(9,146,194,0.25)',
              boxShadow: '0 0 60px rgba(9,146,194,0.15), inset 0 0 60px rgba(0,0,0,0.4)',
            }}
          >
            {/* Drag hint */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2 text-white/70 text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
                </svg>
                Drag to rotate · Click stage to explore
              </div>
            </div>

            <Canvas
              camera={{ position: [0, 1, 14], fov: 45 }}
              shadows
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
            >
              <Suspense fallback={null}>
                <FunnelContent activeStage={activeStage} setActiveStage={handleStageClick} />
              </Suspense>
            </Canvas>
          </div>

          {/* Info Panel - Right Side */}
          <div className="space-y-4 lg:col-span-3">
            {activeStage !== null ? (
              <div
                className="rounded-2xl p-8 border transition-all duration-500 animate-in fade-in slide-in-from-right-4"
                style={{
                  background: `linear-gradient(135deg, ${stageInfo[activeStage].color}22, ${stageInfo[activeStage].color}11)`,
                  borderColor: `${stageInfo[activeStage].color}66`,
                  boxShadow: `0 0 40px ${stageInfo[activeStage].color}22`,
                }}
              >
                <div className="text-5xl mb-4">{stageInfo[activeStage].icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{stageInfo[activeStage].title}</h3>
                <p className="text-gray-300 leading-relaxed mb-6 text-sm">{stageInfo[activeStage].description}</p>
                <div className="flex flex-wrap gap-2">
                  {stageInfo[activeStage].metrics.map((m, i) => (
                    <span key={i} className="text-[10px] px-3 py-1.5 rounded-full font-bold text-white uppercase tracking-wider"
                      style={{ background: `${stageInfo[activeStage].color}55`, border: `1px solid ${stageInfo[activeStage].color}88` }}>
                      ✓ {m}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-8" style={{ background: 'rgba(9,146,194,0.06)', border: '1px solid rgba(9,146,194,0.15)' }}>
                <h3 className="text-xl font-bold text-white mb-3">👆 Click a Funnel Stage</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Select any funnel stage in the 3D viewer to see details about how we approach each phase of the customer journey.</p>
              </div>
            )}

            {/* All stages quick view */}
            <div className="grid grid-cols-2 gap-3">
              {stageInfo.map((stage, i) => (
                <button
                  key={i}
                  onClick={() => handleStageClick(i)}
                  className="text-left rounded-xl p-4 transition-all duration-300 group"
                  style={{
                    background: activeStage === i ? `${stage.color}33` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeStage === i ? stage.color + '88' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: activeStage === i ? `0 0 20px ${stage.color}33` : 'none',
                  }}
                >
                  <div className="text-2xl mb-1">{stage.icon}</div>
                  <div className="text-white font-semibold text-xs">{stage.title.split(' ')[0]}</div>
                  <div className="text-gray-500 text-[10px] mt-0.5">{stage.metrics[0]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

          {/* Bottom Row: CTA & Market Focus */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-2xl bg-[#0992C2]/5 border border-[#0992C2]/20">
            <div className="flex-1">
              <h4 className="text-white font-bold text-xl mb-2">Ready to optimize your business?</h4>
              <p className="text-gray-400 text-sm">We specialize in Real Estate, Dental, and Roofing niches globally (USA, UAE, AUS, UK).</p>
            </div>
            <a
              href="/contact"
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0992C2, #09c4f0)', boxShadow: '0 8px 32px rgba(9,146,194,0.35)' }}
            >
              Get Your 10X Roadmap
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
    </section>
  );
}

export default FunnelScene;
