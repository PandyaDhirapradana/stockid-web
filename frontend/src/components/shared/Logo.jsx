import React from 'react';
import { LOGO_URL, BRAND_NAME } from '../../assets/logo';

const Logo = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2">
      <img
        src={LOGO_URL}
        alt={BRAND_NAME}
        className={`${sizes[size]} object-contain rounded-lg`}
      />
      {showText && (
        <span className={`font-bold text-white ${textSizes[size]}`}>
          Stock<span className="text-accent"> ID</span>
        </span>
      )}
    </div>
  );
};

export default Logo;