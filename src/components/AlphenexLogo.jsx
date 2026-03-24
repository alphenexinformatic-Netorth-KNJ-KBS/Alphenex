import React from 'react';
import logoPng from '../Images/Alphenex Logo.png';

const AlphenexLogo = ({ className = '' }) => {
  return (
    // Explicit width/height prevents layout shift (CLS) and fixes Lighthouse warning.
    // fetchpriority="high" because it's the LCP element in the header.
    <img
      src={logoPng}
      alt="Alphenex Informatic Logo"
      className={className}
      width="272"
      height="68"
      fetchpriority="high"
      style={{ objectFit: 'contain' }}
    />
  );
};

export default AlphenexLogo;
