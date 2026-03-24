
import React from 'react';
import AlphenexLogo from './AlphenexLogo';

const Logo = ({ className = '', height = 'h-10' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <AlphenexLogo className={`${height} w-auto transition-opacity hover:opacity-90`} />
    </div>
  );
};

export default Logo;
