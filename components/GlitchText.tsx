import React from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, className = '' }) => {
  return (
    <div className={`relative inline-block ${className} group`}>
      <span className="relative z-10 block">{text}</span>
      <span 
        className="absolute top-0 left-0 -z-10 w-full h-full text-[#FF003C] opacity-70 animate-[glitch-anim-1_2s_infinite_linear_alternate-reverse]"
        aria-hidden="true"
      >
        {text}
      </span>
      <span 
        className="absolute top-0 left-0 -z-10 w-full h-full text-[#00E5FF] opacity-70 animate-[glitch-anim-2_3s_infinite_linear_alternate-reverse]"
        aria-hidden="true"
      >
        {text}
      </span>
    </div>
  );
};

export default GlitchText;