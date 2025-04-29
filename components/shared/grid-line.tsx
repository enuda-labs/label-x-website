import React from 'react';

export const GridBackground = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
        }}
      />
      <div 
        className="absolute inset-0 bg-gradient-to-b from-bg-orange-500 via-transparent to-transparent"
        style={{
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
        }}
      />
    </div>
  );
};
