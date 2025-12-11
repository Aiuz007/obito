export enum Persona {
  TOBI = 'TOBI',
  WAR_ARC = 'WAR_ARC',
  JINCHURIKI = 'JINCHURIKI'
}

export interface ScrollState {
  offset: number; // 0 to 1
  delta: number;
}

export interface ShaderProps {
  color?: string;
  time?: number;
  distortionStrength?: number;
}