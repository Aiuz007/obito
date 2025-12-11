import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Points, PointMaterial, Trail } from '@react-three/drei';
import './KamuiShader'; 

// --- STAGE 1: TOBI (The Masked Fool) ---
export const TobiStage: React.FC<{ active: boolean }> = ({ active }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const { viewport } = useThree();

  useFrame(({ clock, pointer }) => {
    // Note: useThree provides 'pointer' (normalized -1 to 1).
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime();
      
      const u = (pointer.x + 1) / 2;
      const v = (pointer.y + 1) / 2;
      
      // Update existing vector if possible to avoid GC
      if (materialRef.current.uMouse) {
          materialRef.current.uMouse.set(u, v);
      } else {
          materialRef.current.uMouse = new THREE.Vector2(u, v);
      }

      materialRef.current.uDistortion = THREE.MathUtils.lerp(
        materialRef.current.uDistortion,
        active ? 5.0 : 0.0,
        0.1
      );
    }
    
    if (meshRef.current) {
        meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <group visible={active}>
      <mesh ref={meshRef} position={[0, 0, -1]}>
        <planeGeometry args={[viewport.width * 2, viewport.height * 2, 32, 32]} />
        <kamuiMaterial 
            ref={materialRef} 
            transparent 
            side={THREE.DoubleSide} 
            uColor={new THREE.Color('#FF4500')} 
        />
      </mesh>
      
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 5]} intensity={2} color="#FF8C00" />
    </group>
  );
};

// --- STAGE 2: WAR ARC (The Broken Avenger) ---
export const WarStage: React.FC<{ active: boolean }> = ({ active }) => {
  const rainRef = useRef<THREE.Points>(null);
  
  const rainCount = 1500;
  const positions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25; 
      pos[i * 3 + 1] = Math.random() * 30 - 10; 
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15; 
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!rainRef.current || !active) return;
    
    // Safety Check for undefined geometry or attributes
    if (!rainRef.current.geometry || !rainRef.current.geometry.attributes || !rainRef.current.geometry.attributes.position) return;

    const attr = rainRef.current.geometry.attributes.position;
    const array = attr.array as Float32Array;
    
    for (let i = 0; i < rainCount; i++) {
      let y = array[i * 3 + 1];
      y -= 20 * delta; 
      if (y < -15) y = 15;
      array[i * 3 + 1] = y;
    }
    attr.needsUpdate = true;
  });

  return (
    <group visible={active}>
      <Points ref={rainRef} positions={positions} stride={3}>
        <PointMaterial
          transparent
          color="#A8A8C0"
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial 
            color="#EAEAEA" 
            roughness={0.9} 
            wireframe={true} 
            emissive="#550055" 
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>

      <fog attach="fog" args={['#050505', 2, 15]} />
      <directionalLight position={[-5, 5, 2]} intensity={2} color="#8A2BE2" /> 
      <pointLight position={[2, -2, 2]} intensity={1} color="#FF0000" /> 
    </group>
  );
};

// --- STAGE 3: JINCHURIKI (The False God) ---
export const GodStage: React.FC<{ active: boolean }> = ({ active }) => {
    const orbs = Array.from({ length: 9 }); 
  
    return (
      <group visible={active}>
        <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.2}>
            <mesh>
            <sphereGeometry args={[1.0, 64, 64]} />
            <meshStandardMaterial 
                color="#FFFFFF" 
                emissive="#66FFAA" 
                emissiveIntensity={2}
                toneMapped={false}
            />
            </mesh>
        </Float>
  
        {orbs.map((_, i) => {
            const angle = (i / orbs.length) * Math.PI * 2;
            const radius = 2.8;
            return (
                <Orb key={i} angle={angle} radius={radius} index={i} />
            )
        })}

        <ambientLight intensity={2} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#FFFFFF" distance={10} />
      </group>
    );
  };

const Orb = ({ angle, radius, index }: { angle: number, radius: number, index: number }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if(ref.current) {
            const t = clock.getElapsedTime() * 0.3;
            const offset = index * 0.5;
            ref.current.position.x = Math.cos(angle + t + offset) * radius;
            ref.current.position.y = Math.sin(t * 1.5 + offset) * (radius * 0.5); 
            ref.current.position.z = Math.sin(angle + t + offset) * radius;
        }
    })

    return (
        <group ref={ref}>
            <mesh>
                <sphereGeometry args={[0.15, 32, 32]} />
                <meshStandardMaterial color="#000000" metalness={1} roughness={0} />
            </mesh>
            <Trail width={0.4} length={6} color="#000000" attenuation={(t) => t * t}>
                 <mesh visible={false}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="black" />
                 </mesh>
            </Trail>
        </group>
    )
}