import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Home, Ghost, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ErrorPage = ({ resetError }) => {
  const handleReload = () => {
    if (resetError) resetError();
    else window.location.reload();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#020c1b',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Dynamic 3D Background - Moving Grid and Glows */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '200%',
          height: '200%',
          transform: 'translate(-50%, -50%) rotate(-15deg)',
          background: 'linear-gradient(rgba(9,146,194,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(9,146,194,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        
        {/* Animated Orbs */}
        <motion.div
          animate={{ x: [0, 50, -50, 0], y: [0, 100, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{
            position: 'absolute', top: '10%', left: '20%', width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        />
        <motion.div
          animate={{ x: [0, -80, 80, 0], y: [0, -50, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{
            position: 'absolute', bottom: '20%', right: '15%', width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(9,146,194,0.08) 0%, transparent 70%)',
            filter: 'blur(100px)'
          }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '800px' }}>
        
        {/* BIG 3D 404 TEXT */}
        <div style={{ position: 'relative', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            animate={{ 
              rotateX: [0, 10, -10, 0],
              rotateY: [0, 15, -15, 0],
              y: [0, -10, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
              fontSize: 'clamp(120px, 25vw, 240px)', 
              fontWeight: 900, 
              letterSpacing: '-10px',
              display: 'flex',
              gap: '10px',
              perspective: '1000px',
              transformStyle: 'preserve-3d'
            }}
          >
            <span style={{ 
              color: 'rgba(255,255,255,0.05)', 
              position: 'absolute', 
              transform: 'translateZ(-40px)',
              WebkitTextStroke: '2px rgba(239,68,68,0.2)'
            }}>404</span>
            <span style={{ 
              background: 'linear-gradient(180deg, #fff 0%, #0992C2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              position: 'relative',
              filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5))'
            }}>404</span>
          </motion.div>
          
          {/* Floating Warning Icon */}
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{
              position: 'absolute',
              top: '20%',
              right: '10%',
              background: '#ef4444',
              borderRadius: '50%',
              padding: '15px',
              boxShadow: '0 0 30px rgba(239,68,68,0.5)'
            }}
          >
            <AlertTriangle size={32} color="white" />
          </motion.div>
        </div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 800,
            marginBottom: '16px',
            background: 'linear-gradient(90deg, #fff, #4dc8f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            System Anomaly Detected
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Our AI core has encountered a data fracture. The sequence you requested does not exist in our current matrix. Our engineers have been pinged to recalibrate the portal.
          </p>
        </motion.div>

        {/* Styled Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            onClick={handleReload}
            style={{
              padding: '16px 36px',
              borderRadius: '50px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <RefreshCcw size={20} className="refresh-icon" />
            Recalibrate
          </button>

          <Link to="/" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '16px 40px',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, #0992C2, #4dc8f0)',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 10px 30px rgba(9,146,194,0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(9,146,194,0.6)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(9,146,194,0.4)'; }}
            >
              <Home size={20} />
              Return to Grid
            </button>
          </Link>
        </motion.div>

        {/* Bottom Ghost Icon */}
        <motion.div
          animate={{ x: [-100, 100, -100] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ marginTop: '80px', opacity: 0.2 }}
        >
          <Ghost size={48} />
        </motion.div>
      </div>

      <style>{`
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .refresh-icon { animation: rotate 10s linear infinite; }
      `}</style>
    </div>
  );
};

export default ErrorPage;
