import type { VisualizationContext } from './types'

export function drawTunnel(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, bufferLength, metrics, rotation, getColor } = context
  const { bass } = metrics
  const time = Date.now() * 0.001

  const centerX = width / 2
  const centerY = height / 2
  const rings = 15

  for (let i = rings; i >= 0; i--) {
    const freqIndex = Math.floor((i / rings) * bufferLength)
    const amplitude = dataArray[freqIndex] / 255

    const baseRadius = (i / rings) * (400 + bass * 150) + 20
    const z = i * 30 - time * (100 + bass * 200) % 600
    const perspective = 600 / (600 + z)
    const radius = baseRadius * perspective * (1 + amplitude * 0.3 + bass * 0.3)

    const segments = 24
    const points: { x: number; y: number }[] = []

    for (let j = 0; j < segments; j++) {
      const angle = (j / segments) * Math.PI * 2
      const wobble = Math.sin(angle * 4 + time * 2 + i * 0.5) * amplitude * 20 * (1 + bass)
      const r = radius + wobble

      points.push({
        x: centerX + r * Math.cos(angle + rotation.y),
        y: centerY + r * Math.sin(angle + rotation.y) * 0.8,
      })
    }

    // Draw ring
    ctx.beginPath()
    points.forEach((p, j) => {
      if (j === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    })
    ctx.closePath()

    ctx.strokeStyle = getColor(freqIndex + i * 10)
    ctx.lineWidth = 2 + amplitude * 3
    ctx.stroke()

    // Inner glow - simplified
    if (i < rings / 3) {
      const alpha = (1 - i / rings) * (0.2 + amplitude * 0.3)
      ctx.fillStyle = `rgba(255, 45, 149, ${alpha * 0.1})`
      ctx.fill()
    }
  }
}
