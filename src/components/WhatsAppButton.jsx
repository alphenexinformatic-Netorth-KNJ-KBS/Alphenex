import React from 'react';
import { motion } from 'framer-motion';

const WhatsAppButton = () => {
  const phoneNumber = '917586930827';
  const message = 'Hello Alphenex! I am interested in your services and would like to get a quote.';
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', delay: 1 }}
      style={{
        position: 'fixed',
        bottom: '30px',
        left: '30px',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Water Ripple Effect */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 2],
            opacity: [0.5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeOut"
          }}
          style={{
            position: 'absolute',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '2px solid rgba(37,211,102,0.4)',
          }}
        />
      ))}

      {/* Floating 3D Bubble */}
      <motion.div
        animate={{ 
          y: [-5, 5, -5],
          rotate: [-1, 1, -1]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'relative' }}
      >
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: '65px',
            height: '65px',
            background: 'linear-gradient(135deg, #25D366 0%, #128c3f 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(37,211,102,0.4), inset 0 2px 5px rgba(255,255,255,0.4)',
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            textDecoration: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="group"
        >
          {/* Glossy Reflection */}
          <div style={{
            position: 'absolute',
            top: '5%',
            left: '15%',
            width: '70%',
            height: '35%',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50% 50% 40% 40%',
            filter: 'blur(2px)'
          }} />

          {/* Premium WhatsApp Icon Svg */}
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 448 512" 
            fill="white"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.3 2.5-2.6 5.5-6.1 8.3-9.1 2.8-2.8 3.7-4.9 5.5-8.1 1.9-3.2 1-6.1-.5-8.9-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>

          {/* Connect Us Box - appears on hover */}
          <div className="absolute left-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
            background: 'rgba(37,211,102,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '8px 16px',
            borderRadius: '12px',
            whiteSpace: 'nowrap',
            color: 'white',
            fontSize: '14px',
            fontWeight: 700,
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}>
            Chat on WhatsApp
          </div>
        </a>
      </motion.div>
    </motion.div>
  );
};

export default WhatsAppButton;
