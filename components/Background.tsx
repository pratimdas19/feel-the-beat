import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Deep dark base */}
      <div className="absolute inset-0 bg-dark-900"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-spotify/10 rounded-full blur-[120px] animate-float opacity-40 mix-blend-screen"></div>
      <div className="absolute top-[20%] right-[0%] w-[40vw] h-[40vw] bg-purple-900/20 rounded-full blur-[100px] animate-float opacity-40 mix-blend-screen" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[150px] animate-float opacity-30 mix-blend-screen" style={{ animationDelay: '4s' }}></div>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    </div>
  );
};

export default Background;