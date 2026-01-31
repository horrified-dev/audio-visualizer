export interface Point3D {
  x: number
  y: number
  z: number
}

export interface ProjectedPoint {
  x: number
  y: number
  scale: number
  culled: boolean
}

export function rotatePoint(
  x: number,
  y: number,
  z: number,
  rotationX: number,
  rotationY: number
): Point3D {
  // Rotate around Y axis
  const cosY = Math.cos(rotationY)
  const sinY = Math.sin(rotationY)
  const x1 = x * cosY - z * sinY
  const z1 = x * sinY + z * cosY

  // Rotate around X axis
  const cosX = Math.cos(rotationX)
  const sinX = Math.sin(rotationX)
  const y1 = y * cosX - z1 * sinX
  const z2 = y * sinX + z1 * cosX

  return { x: x1, y: y1, z: z2 }
}

export function project3D(
  x: number,
  y: number,
  z: number,
  centerX: number,
  centerY: number,
  fov: number = 500,
  width: number = 1920,
  height: number = 1080
): ProjectedPoint {
  // Near plane clipping - don't render objects behind camera
  const nearPlane = -fov + 50
  const farPlane = fov * 3

  // Clamp z to prevent division issues
  const clampedZ = Math.max(z, nearPlane)
  const scale = fov / (fov + clampedZ)

  const screenX = centerX + x * scale
  const screenY = centerY + y * scale

  // Check if object is culled (behind camera, too far, or off screen)
  const margin = 200
  const offScreen = screenX < -margin || screenX > width + margin ||
                    screenY < -margin || screenY > height + margin
  const culled = z < nearPlane || z > farPlane || offScreen

  return {
    x: screenX,
    y: screenY,
    scale: Math.max(0, scale),
    culled
  }
}
