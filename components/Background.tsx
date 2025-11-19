import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-brand-blue">
      {/* Subtle noise texture for the retro poster feel */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      
      {/* Simple geometric shapes inspired by the reference image */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-brand-red opacity-20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-orange opacity-10 rounded-full blur-[100px]"></div>
    </div>
  );
};

export default Background;