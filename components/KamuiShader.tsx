import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// GLSL Fragment Shader for Kamui Spiral
const kamuiFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uDistortion;
  uniform vec2 uMouse; // Mouse position (0 to 1)
  
  varying vec2 vUv;

  void main() {
    // Center the effect on the mouse position
    vec2 uv = vUv - uMouse;
    
    // Correct aspect ratio if needed, but for full screen plane vUv is usually enough
    // if using a square plane. For simplicity we assume square UVs on the plane.
    
    float len = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // The Kamui Twist Logic
    // We warp the angle based on distance to the mouse center and time
    // Only distort if close to mouse center
    float influence = smoothstep(0.6, 0.0, len);
    float twist = uDistortion * influence * 2.0;
    
    float spiral = angle + twist * sin(uTime * 1.5);
    
    // Map back to UV space relative to mouse
    vec2 warpedRelative = vec2(cos(spiral), sin(spiral)) * len;
    vec2 finalUv = warpedRelative + uMouse;
    
    // Create a procedural spiral pattern
    float stripes = sin(len * 50.0 + spiral * 8.0 - uTime * 3.0);
    float alpha = smoothstep(0.4, 0.5, stripes) * influence;
    
    vec3 finalColor = mix(vec3(0.0), uColor, alpha);
    
    // Soften edges of the effect
    float opacity = alpha * smoothstep(0.5, 0.0, len);
    
    gl_FragColor = vec4(finalColor, opacity);
  }
`;

const kamuiVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const KamuiMaterial = shaderMaterial(
  { 
    uTime: 0, 
    uColor: new THREE.Color('#FF4500'), 
    uDistortion: 0.0,
    uMouse: new THREE.Vector2(0.5, 0.5)
  },
  kamuiVertexShader,
  kamuiFragmentShader
);

extend({ KamuiMaterial });

// Add type safety for the new element
declare module '@react-three/fiber' {
  interface ThreeElements {
    kamuiMaterial: {
      uTime?: number;
      uColor?: THREE.Color;
      uDistortion?: number;
      uMouse?: THREE.Vector2;
      transparent?: boolean;
      side?: THREE.Side;
      [key: string]: any;
    }
  }
}

export { KamuiMaterial };