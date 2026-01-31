import type { VisualizationContext } from './types'

export function drawBassRing(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, bufferLength, metrics, colorScheme, getColor } = context
  const { bass } = metrics
  const time = Date.now() * 0.001

  const centerX = width / 2
  const centerY = height / 2

  const ringCount = 15
  for (let i = 0; i < ringCount; i++) {
    const freqIndex = Math.floor((i / ringCount) * bufferLength * 0.5) // Focus on lower frequencies
    const amplitude = dataArray[freqIndex] / 255

    const baseRadius = (50 + i * 30) * (1 + bass * 0.3)
    const pulse = Math.sin(time * 8 - i * 0.5) * amplitude * 20 * (1 + bass)
    const radius = baseRadius + pulse + bass * 80

    // Ring thickness based on amplitude
    const thickness = 3 + amplitude * 15

    // Wobble effect
    ctx.beginPath()
    const segments = 64
    for (let j = 0; j <= segments; j++) {
      const angle = (j / segments) * Math.PI * 2
      const wobble = Math.sin(angle * 8 + time * 10) * amplitude * 15
      const r = radius + wobble
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)

      if (j === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()

    ctx.strokeStyle = getColor(i * 20 + amplitude * 100)
    ctx.lineWidth = thickness
    ctx.globalAlpha = 0.5 + amplitude * 0.5
    ctx.stroke()

    // Inner glow for high amplitude
    if (amplitude > 0.6) {
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = thickness * 0.5
      ctx.globalAlpha = amplitude - 0.5
      ctx.stroke()
    }
  }

  ctx.globalAlpha = 1

  // Center bass indicator
  const coreSize = 40 + bass * 120
  const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize)
  coreGrad.addColorStop(0, '#fff')
  coreGrad.addColorStop(0.3, colorScheme.primary)
  coreGrad.addColorStop(0.6, colorScheme.secondary)
  coreGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = coreGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2)
  ctx.fill()

  // Bass pulse ring - on beat
  if (bass > 0.5) {
    ctx.beginPath()
    ctx.arc(centerX, centerY, coreSize * 1.5, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255, 255, 255, ${bass - 0.3})`
    ctx.lineWidth = 3 + bass * 5
    ctx.stroke()
  }
}
