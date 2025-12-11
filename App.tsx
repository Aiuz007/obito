import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, Scroll, useScroll, Preload, Loader } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TobiStage, WarStage, GodStage } from './components/Stages';
import GlitchText from './components/GlitchText';
import { Persona } from './types';

// --- VISUAL NARRATIVE LOGIC ---
const SceneDirector: React.FC<{ setPersona: (p: Persona) => void }> = ({ setPersona }) => {
  const scroll = useScroll();
  const { camera } = useThree();

  useFrame(() => {
    // Scroll offset is 0 to 1
    // Zone 1: Tobi (0 - 0.33)
    if (scroll.offset < 0.30) {
      setPersona(Persona.TOBI);
      camera.position.z = THREE.MathUtils.lerp(6, 5, scroll.offset * 3);
      camera.position.y = THREE.MathUtils.lerp(0, 0, scroll.offset * 3);
    }
    // Zone 2: War Arc (0.33 - 0.66)
    else if (scroll.offset >= 0.30 && scroll.offset < 0.60) {
      setPersona(Persona.WAR_ARC);
      const relativeOffset = (scroll.offset - 0.30) * 3.3; 
      camera.position.z = THREE.MathUtils.lerp(5, 7, relativeOffset);
      camera.position.y = THREE.MathUtils.lerp(0, 0.5, relativeOffset);
    }
    // Zone 3: God (0.66 - 1.0)
    else {
      setPersona(Persona.JINCHURIKI);
      const relativeOffset = (scroll.offset - 0.60) * 2.5;
      camera.position.z = THREE.MathUtils.lerp(7, 4, relativeOffset);
      camera.position.y = THREE.MathUtils.lerp(0.5, 0, relativeOffset);
    }
  });

  return null;
};

// --- COMPOSITION ---
const Experience: React.FC<{ persona: Persona, setPersona: (p: Persona) => void }> = ({ persona, setPersona }) => {
  return (
    <>
      <SceneDirector setPersona={setPersona} />
      
      <color 
        attach="background" 
        args={[persona === Persona.JINCHURIKI ? '#F0FFF0' : '#020202']} 
      />
      
      <TobiStage active={persona === Persona.TOBI} />
      <WarStage active={persona === Persona.WAR_ARC} />
      <GodStage active={persona === Persona.JINCHURIKI} />

      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom 
            luminanceThreshold={persona === Persona.JINCHURIKI ? 0.9 : 0.4} 
            mipmapBlur 
            intensity={persona === Persona.JINCHURIKI ? 1.5 : 0.8} 
            radius={0.6}
        />
        <Noise opacity={persona === Persona.JINCHURIKI ? 0.05 : 0.15} />
        <Vignette eskil={false} offset={0.1} darkness={1.0} />
      </EffectComposer>
    </>
  );
};

// --- UI COMPONENTS ---

const Section: React.FC<{ 
  pageIndex: number; 
  children: React.ReactNode;
  align: 'left' | 'right' | 'center';
}> = ({ pageIndex, children, align }) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (!ref.current) return;
    const pageHeight = 1 / 3;
    const start = pageIndex * pageHeight;
    const visibleRange = scroll.range(start, pageHeight);
    ref.current.style.opacity = `${visibleRange}`;
    ref.current.style.transform = `translateY(${(1 - visibleRange) * 50}px)`;
  });

  const alignClass = 
    align === 'left' ? 'items-start text-left' :
    align === 'right' ? 'items-end text-right' :
    'items-center text-center';

  return (
    <section className={`w-full h-[100vh] flex flex-col justify-center p-6 md:p-20 relative pointer-events-none ${alignClass}`}>
      <div ref={ref} className="transition-transform duration-100 ease-out pointer-events-auto">
        {children}
      </div>
    </section>
  );
};

const FixedHUD: React.FC<{ persona: Persona }> = ({ persona }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50 mix-blend-difference text-white">
      <div className="absolute top-10 left-6 md:left-10">
        <h3 className="text-[10px] tracking-[0.3em] font-bold opacity-70 mb-2">CHAPTER 01</h3>
        <GlitchText 
          text="THE FRACTURED PSYCHE" 
          className="text-2xl md:text-3xl font-[Syncopate]" 
        />
      </div>

      <div className="absolute bottom-10 right-6 md:right-10 flex flex-col items-end gap-1">
         <PersonaLabel active={persona === Persona.TOBI} label="NOBODY" color="text-orange-500" />
         <PersonaLabel active={persona === Persona.WAR_ARC} label="AVENGER" color="text-purple-500" />
         <PersonaLabel active={persona === Persona.JINCHURIKI} label="SAVIOR" color="text-teal-400" />
      </div>
    </div>
  );
};

const PersonaLabel = ({ active, label, color }: { active: boolean, label: string, color: string }) => (
    <div className={`transition-all duration-500 ${active ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4 blur-[2px]'}`}>
        <span className={`${color} font-bold text-lg tracking-widest font-[Syncopate]`}>{label}</span>
    </div>
);

export default function App() {
  const [persona, setPersona] = useState<Persona>(Persona.TOBI);

  return (
    <div className="w-full h-full bg-black relative">
      <Canvas shadows camera={{ position: [0, 0, 6], fov: 35 }}>
        <Suspense fallback={null}>
          <ScrollControls pages={3} damping={0.2}>
            <Experience persona={persona} setPersona={setPersona} />
            <Scroll html>
                <div className="w-screen">
                    {/* PAGE 1 */}
                    <Section pageIndex={0} align="center">
                        <div className="max-w-md">
                            <h1 className="text-6xl font-[Syncopate] font-bold text-orange-600 mb-6 tracking-tighter">THE MASK</h1>
                            <p className="text-gray-300 font-[Rajdhani] text-lg bg-black/80 p-6 border-l-4 border-orange-500">
                                "I am no one. I don't want to be anyone."
                            </p>
                        </div>
                    </Section>

                    {/* PAGE 2 */}
                    <Section pageIndex={1} align="right">
                        <div className="max-w-md">
                            <h1 className="text-6xl font-[Syncopate] font-bold text-purple-500 mb-6 tracking-tighter">THE CRACK</h1>
                            <p className="text-gray-300 font-[Rajdhani] text-lg bg-black/80 p-6 border-r-4 border-purple-500">
                                Reality is just a hell driven by loss.
                            </p>
                        </div>
                    </Section>

                    {/* PAGE 3 */}
                    <Section pageIndex={2} align="center">
                         <div className="max-w-lg bg-white/10 backdrop-blur-md p-10 rounded-lg border border-white/20">
                            <h1 className="text-5xl font-[Syncopate] font-bold text-teal-300 mb-6">PROJECT TSUKUYOMI</h1>
                            <button className="px-8 py-3 bg-teal-400 text-black font-bold tracking-widest hover:bg-white transition-colors">
                                INITIATE
                            </button>
                        </div>
                    </Section>
                </div>
            </Scroll>
          </ScrollControls>
          <Preload all />
        </Suspense>
      </Canvas>
      <Loader />
      <FixedHUD persona={persona} />
    </div>
  );
}