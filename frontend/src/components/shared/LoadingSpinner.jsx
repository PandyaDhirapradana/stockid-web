import React from 'react';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-2 border-accent border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-zinc-400 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;