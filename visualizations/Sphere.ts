import type { VisualizationContext } from './types'
import { rotatePoint, project3D } from '@/lib/utils/projection'

interface SpherePoint {
  x: number
  y: number
  z: number
  scale: number
  amplitude: number
  freqIndex: number
}

export function drawSphere(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, bufferLength, metrics, rotation, getColor } = context
  const { bass } = metrics

  const centerX = width / 2
  const centerY = height / 2
  const baseRadius = Math.min(width, height) * 0.25 * (1 + bass * 0.3)

  const points: SpherePoint[] = []
  const rings = 16
  const segments = 32

  for (let i = 0; i < rings; i++) {
    const phi = (i / rings) * Math.PI
    const sinPhi = Math.sin(phi)
    const cosPhi = Math.cos(phi)

    for (let j = 0; j < segments; j++) {
      const theta = (j / segments) * Math.PI * 2
      const sinTheta = Math.sin(theta)
      const cosTheta = Math.cos(theta)

      const freqIndex = Math.floor((i * segments + j) % bufferLength)
      const amplitude = dataArray[freqIndex] / 255
      const radius = baseRadius * (1 + amplitude * 0.5)

      const x = radius * sinPhi * cosTheta
      const y = radius * cosPhi
      const z = radius * sinPhi * sinTheta

      const rotated = rotatePoint(x, y, z, rotation.x, rotation.y)
      const projected = project3D(rotated.x, rotated.y, rotated.z, centerX, centerY, 500, width, height)

      if (!projected.culled) {
        points.push({
          x: projected.x,
          y: projected.y,
          z: rotated.z,
          scale: projected.scale,
          amplitude,
          freqIndex,
        })
      }
    }
  }

  // Sort by z for proper depth rendering
  points.sort((a, b) => a.z - b.z)

  // Draw connections - optimized with spatial check and batched rendering
  ctx.lineWidth = 0.5
  ctx.strokeStyle = 'rgba(0, 247, 255, 0.15)'
  ctx.beginPath()
  const len = points.length
  for (let i = 0; i < len; i += 2) {
    const p1 = points[i]
    for (let j = i + 1; j < Math.min(i + 6, len); j++) {
      const p2 = points[j]
      const dx = p1.x - p2.x
      const dy = p1.y - p2.y
      if (dx * dx + dy * dy < 2500) {
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
      }
    }
  }
  ctx.stroke()

  // Draw points
  for (let i = 0; i < len; i++) {
    const p = points[i]
    const size = (2 + p.amplitude * 6) * p.scale
    if (size < 0.5) continue

    // Glow
    ctx.fillStyle = getColor(p.freqIndex + p.amplitude * 100)
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.arc(p.x, p.y, size * 1.5, 0, Math.PI * 2)
    ctx.fill()

    // Core
    ctx.globalAlpha = 1
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(p.x, p.y, size * 0.4, 0, Math.PI * 2)
    ctx.fill()
  }
}
