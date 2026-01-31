import type { VisualizationContext } from './types'
import { rotatePoint, project3D } from '@/lib/utils/projection'

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  freqBand: number
}

let particles: Particle[] = []

export function initParticles(): void {
  particles = []
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 600,
      z: (Math.random() - 0.5) * 600,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      vz: (Math.random() - 0.5) * 2,
      freqBand: Math.floor(Math.random() * 256),
    })
  }
}

export function drawParticles(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, metrics, rotation, getColor } = context
  const { bass } = metrics

  if (particles.length === 0) initParticles()

  const centerX = width / 2
  const centerY = height / 2

  // Update and draw particles
  const projectedParticles = particles.map(p => {
    const amplitude = dataArray[p.freqBand] / 255

    // Update velocity and position
    p.vx += (Math.random() - 0.5) * 0.2 * (1 + amplitude * 2)
    p.vy += (Math.random() - 0.5) * 0.2 * (1 + amplitude * 2)
    p.vz += (Math.random() - 0.5) * 0.2 * (1 + amplitude * 2)

    // Damping
    p.vx *= 0.98
    p.vy *= 0.98
    p.vz *= 0.98

    p.x += p.vx
    p.y += p.vy
    p.z += p.vz

    // Contain within bounds
    const bound = 300
    if (Math.abs(p.x) > bound) p.vx *= -1
    if (Math.abs(p.y) > bound) p.vy *= -1
    if (Math.abs(p.z) > bound) p.vz *= -1

    const rotated = rotatePoint(p.x, p.y, p.z, rotation.x, rotation.y)
    const projected = project3D(rotated.x, rotated.y, rotated.z, centerX, centerY, 500, width, height)

    return {
      ...p,
      screenX: projected.x,
      screenY: projected.y,
      screenZ: rotated.z,
      scale: projected.scale,
      amplitude,
      culled: projected.culled,
    }
  })

  // Filter and sort
  const visibleParticles = projectedParticles.filter(p => !p.culled)
  visibleParticles.sort((a, b) => a.screenZ - b.screenZ)

  // Draw connections
  ctx.lineWidth = 0.5
  ctx.beginPath()
  for (let i = 0; i < visibleParticles.length; i++) {
    const p1 = visibleParticles[i]
    for (let j = i + 1; j < visibleParticles.length; j++) {
      const p2 = visibleParticles[j]
      const dx = p1.screenX - p2.screenX
      const dy = p1.screenY - p2.screenY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 100 + bass * 50) {
        ctx.strokeStyle = `rgba(0, 247, 255, ${0.2 * (1 - dist / (100 + bass * 50))})`
        ctx.moveTo(p1.screenX, p1.screenY)
        ctx.lineTo(p2.screenX, p2.screenY)
      }
    }
  }
  ctx.stroke()

  // Draw particles
  visibleParticles.forEach(p => {
    const size = (2 + p.amplitude * 4) * p.scale
    if (size < 0.5) return

    ctx.fillStyle = getColor(p.freqBand + p.amplitude * 100)
    ctx.globalAlpha = 0.5 + p.amplitude * 0.5
    ctx.beginPath()
    ctx.arc(p.screenX, p.screenY, size, 0, Math.PI * 2)
    ctx.fill()

    // Core
    ctx.globalAlpha = 1
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(p.screenX, p.screenY, size * 0.3, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.globalAlpha = 1
}
