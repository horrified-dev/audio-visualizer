import type { VisualizationContext } from './types'

export function drawVortex(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, bufferLength, metrics, rotation, colorScheme, getColor } = context
  const { bass, average } = metrics
  const time = Date.now() * 0.001

  const centerX = width / 2
  const centerY = height / 2
  const spirals = 5

  const gradient = ctx.createLinearGradient(centerX, centerY - 350, centerX, centerY + 350)
  gradient.addColorStop(0, colorScheme.primary)
  gradient.addColorStop(0.5, colorScheme.secondary)
  gradient.addColorStop(1, colorScheme.tertiary)

  for (let spiral = 0; spiral < spirals; spiral++) {
    const baseAngle = (spiral / spirals) * Math.PI * 2

    ctx.beginPath()

    for (let i = 0; i < 120; i++) {
      const t = i / 120
      const freqIndex = Math.floor(t * bufferLength)
      const amplitude = dataArray[freqIndex] / 255

      const radius = t * (350 + bass * 100) * (1 + amplitude * 0.2 + bass * 0.3)
      const angle = baseAngle + t * Math.PI * 4 + rotation.y * 2 + time * (1 + bass * 2)

      const wobble = Math.sin(t * 20 + time * 3) * amplitude * 15 * (1 + bass * 2)

      const x = centerX + (radius + wobble) * Math.cos(angle)
      const y = centerY + (radius + wobble) * Math.sin(angle) * 0.7

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)

      // Draw energy points inline
      if (i % 15 === 0 && amplitude > 0.5) {
        ctx.stroke()
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(x, y, 2 + amplitude * 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(x, y)
      }
    }

    ctx.strokeStyle = gradient
    ctx.lineWidth = 3
    ctx.stroke()
  }

  // Center eye - bass reactive
  const eyeSize = 50 + bass * 50 + average * 30
  const eyeGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, eyeSize)
  eyeGrad.addColorStop(0, '#000')
  eyeGrad.addColorStop(0.5, `rgba(139, 92, 246, ${0.5 + bass * 0.3})`)
  eyeGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = eyeGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, eyeSize, 0, Math.PI * 2)
  ctx.fill()
}
