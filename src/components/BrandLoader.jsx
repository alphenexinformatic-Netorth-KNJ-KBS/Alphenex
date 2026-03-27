import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BrandLoader = ({ isVisible = true }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="brand-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'radial-gradient(ellipse at center, #0a1628 0%, #020c1b 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Ambient Background Glow */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {/* Top-left subtle glow */}
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '30%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(9,146,194,0.06) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(60px)',
            }} />
            {/* Bottom-right subtle glow */}
            <div style={{
              position: 'absolute',
              bottom: '20%',
              right: '30%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(77,200,240,0.04) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(60px)',
            }} />
          </div>

          {/* Main Loader Container */}
          <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>

            {/* The AI + Ring Assembly */}
            <div style={{
              position: 'relative',
              width: '320px',
              height: '320px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>

              {/* === OUTER RING — Static with subtle glow === */}
              <div style={{
                position: 'absolute',
                inset: '0',
                borderRadius: '50%',
                border: '1.5px solid rgba(77,200,240,0.12)',
                boxShadow: '0 0 40px rgba(9,146,194,0.05), inset 0 0 40px rgba(9,146,194,0.03)',
              }} />

              {/* === ROTATING GLOW ARC on the ring === */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  inset: '-2px',
                  borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(77,200,240,0.25) 80%, rgba(9,146,194,0.5) 90%, transparent 100%)',
                  WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 2px))',
                  mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #fff calc(100% - 2px))',
                }}
              />

              {/* === ORBITING DOT — travels along the ring === */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  width: '320px',
                  height: '320px',
                  top: 0,
                  left: 0,
                }}
              >
                {/* The Dot */}
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    boxShadow: [
                      '0 0 15px 4px rgba(77,200,240,0.6)',
                      '0 0 30px 8px rgba(77,200,240,0.9)',
                      '0 0 15px 4px rgba(77,200,240,0.6)',
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    top: '-7px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4dc8f0, #0992C2)',
                    boxShadow: '0 0 20px 5px rgba(77,200,240,0.7)',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}
                />
                {/* Dot Trail */}
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(77,200,240,0.3) 0%, transparent 70%)',
                  filter: 'blur(6px)',
                }} />
              </motion.div>

              {/* === THE "AI." TEXT — 3D Styled === */}
              <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                alignItems: 'baseline',
                gap: '0px',
                userSelect: 'none',
                perspective: '800px',
              }}>
                {/* 3D Shadow Layer (behind text for depth) */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '4px',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0px',
                  opacity: 0.15,
                  filter: 'blur(4px)',
                  zIndex: -1,
                }}>
                  <span style={{
                    fontSize: '120px',
                    fontWeight: 900,
                    fontFamily: '"Outfit", sans-serif',
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                    color: '#0992C2',
                  }}>A</span>
                  <span style={{
                    fontSize: '120px',
                    fontWeight: 900,
                    fontFamily: '"Outfit", sans-serif',
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                    color: '#4dc8f0',
                  }}>I</span>
                  <span style={{
                    fontSize: '120px',
                    fontWeight: 900,
                    fontFamily: '"Outfit", sans-serif',
                    lineHeight: 1,
                    color: '#4dc8f0',
                  }}>.</span>
                </div>

                {/* Letter A — Solid White with subtle shadow */}
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  style={{
                    fontSize: '120px',
                    fontWeight: 900,
                    fontFamily: '"Outfit", sans-serif',
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                    color: '#ffffff',
                    textShadow: '0 0 30px rgba(255,255,255,0.15), 0 4px 20px rgba(0,0,0,0.4)',
                  }}
                >
                  A
                </motion.span>

                {/* Letter I — Gradient White to Cyan */}
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{
                    fontSize: '120px',
                    fontWeight: 900,
                    fontFamily: '"Outfit", sans-serif',
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(180deg, #ffffff 30%, #4dc8f0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.4)) drop-shadow(0 0 25px rgba(77,200,240,0.2))',
                  }}
                >
                  I
                </motion.span>

                {/* The Dot "." — Animated Cyan Accent */}
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 }}
                  style={{
                    fontSize: '120px',
                    fontWeight: 900,
                    fontFamily: '"Outfit", sans-serif',
                    lineHeight: 1,
                    color: '#4dc8f0',
                    textShadow: '0 0 30px rgba(77,200,240,0.6), 0 0 60px rgba(77,200,240,0.3)',
                    marginLeft: '-4px',
                  }}
                >
                  .
                </motion.span>
              </div>

              {/* === INNER GLOW behind the text === */}
              <div style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(9,146,194,0.08) 0%, transparent 70%)',
                filter: 'blur(30px)',
                zIndex: 1,
              }} />
            </div>

            {/* === BOTTOM REFLECTION === */}
            <div style={{
              marginTop: '-10px',
              width: '200px',
              height: '30px',
              background: 'radial-gradient(ellipse, rgba(77,200,240,0.08) 0%, transparent 70%)',
              borderRadius: '100%',
              filter: 'blur(8px)',
              transform: 'scaleX(1.5)',
            }} />

            {/* === BRANDING TEXT === */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              style={{
                marginTop: '30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{
                color: 'rgba(77,200,240,0.5)',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.55em',
                whiteSpace: 'nowrap',
                fontFamily: '"Outfit", sans-serif',
              }}>
                Alphenex Informatic
              </span>

              {/* Animated underline */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.6, ease: 'easeOut' }}
                style={{
                  width: '60px',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, rgba(77,200,240,0.4), transparent)',
                  transformOrigin: 'center',
                }}
              />
            </motion.div>

            {/* === LOADING SHIMMER BAR (optional subtle indicator) === */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              style={{
                marginTop: '40px',
                width: '120px',
                height: '3px',
                borderRadius: '10px',
                background: 'rgba(77,200,240,0.08)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <motion.div
                animate={{ x: ['-120px', '120px'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '60px',
                  height: '100%',
                  borderRadius: '10px',
                  background: 'linear-gradient(90deg, transparent, rgba(77,200,240,0.5), transparent)',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandLoader;
