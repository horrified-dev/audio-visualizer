import type { VisualizationContext } from './types'
import { rotatePoint, project3D } from '@/lib/utils/projection'

interface Star {
  angle: number
  radius: number
  z: number
  size: number
  spiralArm: number
  freqBand: number
}

let stars: Star[] = []

export function initGalaxy(bufferLength: number = 256): void {
  stars = []
  for (let i = 0; i < 250; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 300 + 20
    stars.push({
      angle,
      radius,
      z: (Math.random() - 0.5) * 100,
      size: Math.random() * 2 + 0.5,
      spiralArm: Math.floor(Math.random() * 4),
      freqBand: Math.floor(Math.random() * bufferLength),
    })
  }
}

export function drawGalaxy(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, bufferLength, metrics, rotation, getColor } = context
  const { bass } = metrics

  if (stars.length === 0) initGalaxy(bufferLength)

  const centerX = width / 2
  const centerY = height / 2

  // Draw spiral arms
  for (let arm = 0; arm < 4; arm++) {
    ctx.beginPath()
    for (let r = 20; r < 350 + bass * 100; r += 5) {
      const freqIndex = Math.floor((r / 350) * bufferLength)
      const amplitude = dataArray[freqIndex] / 255

      const spiralAngle = (r * 0.03) + (arm * Math.PI / 2) + rotation.y + bass * 0.3
      const x = r * Math.cos(spiralAngle)
      const y = r * Math.sin(spiralAngle) * 0.4
      const z = 0

      const rotated = rotatePoint(x, y, z, rotation.x, rotation.y)
      const projected = project3D(rotated.x, rotated.y, rotated.z, centerX, centerY, 500, width, height)

      if (r === 20) ctx.moveTo(projected.x, projected.y)
      else ctx.lineTo(projected.x, projected.y)
    }
    ctx.strokeStyle = `rgba(139, 92, 246, 0.3)`
    ctx.lineWidth = 20
    ctx.stroke()
  }

  // Draw and update stars
  const sortedStars = stars.map(star => {
    const amplitude = dataArray[star.freqBand] / 255

    star.angle += 0.002 + amplitude * 0.01 + bass * 0.02

    const spiralAngle = star.angle + star.spiralArm * (Math.PI / 2)
    const x = star.radius * Math.cos(spiralAngle)
    const y = star.radius * Math.sin(spiralAngle) * 0.4

    const rotated = rotatePoint(x, y, star.z, rotation.x, rotation.y)
    const projected = project3D(rotated.x, rotated.y, rotated.z, centerX, centerY, 500, width, height)

    return {
      ...star,
      screenX: projected.x,
      screenY: projected.y,
      screenZ: rotated.z,
      scale: projected.scale,
      amplitude,
      culled: projected.culled,
    }
  })

  // Filter and sort
  const visibleStars = sortedStars.filter(s => !s.culled)
  visibleStars.sort((a, b) => a.screenZ - b.screenZ)

  visibleStars.forEach(star => {
    const size = (star.size + star.amplitude * 3) * star.scale
    const brightness = 0.3 + star.amplitude * 0.7

    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`
    ctx.beginPath()
    ctx.arc(star.screenX, star.screenY, size, 0, Math.PI * 2)
    ctx.fill()

    if (star.amplitude > 0.5) {
      ctx.fillStyle = getColor(star.freqBand)
      ctx.beginPath()
      ctx.arc(star.screenX, star.screenY, size * 2, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  // Center black hole - bass reactive
  const bhSize = 60 + bass * 50 + metrics.average * 30
  const bhGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, bhSize)
  bhGrad.addColorStop(0, '#000')
  bhGrad.addColorStop(0.5, `rgba(139, 92, 246, ${0.5 + bass * 0.3})`)
  bhGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = bhGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, bhSize, 0, Math.PI * 2)
  ctx.fill()
}
