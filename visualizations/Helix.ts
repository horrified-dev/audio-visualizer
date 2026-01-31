import type { VisualizationContext } from './types'
import { rotatePoint, project3D } from '@/lib/utils/projection'

interface HelixPoint {
  x: number
  y: number
  amplitude: number
  z: number
  culled: boolean
}

export function drawHelix(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, bufferLength, metrics, rotation, colorScheme } = context
  const { bass } = metrics

  const centerX = width / 2
  const centerY = height / 2
  const helixLength = 400 + bass * 100
  const radius = 80 + bass * 40
  const points1: HelixPoint[] = []
  const points2: HelixPoint[] = []
  const segments = 100

  for (let i = 0; i < segments; i++) {
    const t = i / segments
    const freqIndex = Math.floor(t * bufferLength)
    const amplitude = dataArray[freqIndex] / 255

    const y = (t - 0.5) * helixLength
    const angle = t * Math.PI * 4 + rotation.y * 2 + bass * 0.5
    const radiusMod = radius * (1 + amplitude * 0.5 + bass * 0.3)

    const x1 = radiusMod * Math.cos(angle)
    const z1 = radiusMod * Math.sin(angle)
    const x2 = radiusMod * Math.cos(angle + Math.PI)
    const z2 = radiusMod * Math.sin(angle + Math.PI)

    const r1 = rotatePoint(x1, y, z1, rotation.x, rotation.y)
    const r2 = rotatePoint(x2, y, z2, rotation.x, rotation.y)

    const p1 = project3D(r1.x, r1.y, r1.z, centerX, centerY, 500, width, height)
    const p2 = project3D(r2.x, r2.y, r2.z, centerX, centerY, 500, width, height)

    points1.push({ x: p1.x, y: p1.y, amplitude, z: r1.z, culled: p1.culled })
    points2.push({ x: p2.x, y: p2.y, amplitude, z: r2.z, culled: p2.culled })
  }

  // Draw connecting rungs
  for (let i = 0; i < segments; i += 5) {
    const p1 = points1[i]
    const p2 = points2[i]
    if (p1.culled && p2.culled) continue

    const alpha = 0.3 + p1.amplitude * 0.7

    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`
    ctx.lineWidth = 2 + p1.amplitude * 4
    ctx.stroke()
  }

  // Draw strand 1
  ctx.beginPath()
  points1.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y)
    else ctx.lineTo(p.x, p.y)
  })
  ctx.strokeStyle = colorScheme.primary
  ctx.lineWidth = 4
  ctx.stroke()

  // Draw strand 2
  ctx.beginPath()
  points2.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y)
    else ctx.lineTo(p.x, p.y)
  })
  ctx.strokeStyle = colorScheme.secondary
  ctx.stroke()

  // Draw nodes
  points1.forEach((p, i) => {
    if (i % 5 === 0 && !p.culled) {
      const size = 4 + p.amplitude * 8
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  })
  points2.forEach((p, i) => {
    if (i % 5 === 0 && !p.culled) {
      const size = 4 + p.amplitude * 8
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}
