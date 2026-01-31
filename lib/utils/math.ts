// Pre-computed trig lookup tables for performance
export const SIN_TABLE = new Float32Array(360)
export const COS_TABLE = new Float32Array(360)

// Initialize lookup tables
for (let i = 0; i < 360; i++) {
  SIN_TABLE[i] = Math.sin(i * Math.PI / 180)
  COS_TABLE[i] = Math.cos(i * Math.PI / 180)
}

export function fastSin(angle: number): number {
  const deg = ((angle * 180 / Math.PI) % 360 + 360) % 360
  return SIN_TABLE[Math.floor(deg)]
}

export function fastCos(angle: number): number {
  const deg = ((angle * 180 / Math.PI) % 360 + 360) % 360
  return COS_TABLE[Math.floor(deg)]
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}
