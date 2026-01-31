import type { VisualizationContext } from './types'

export function drawTrapNation(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, bufferLength, metrics, colorScheme, getColor } = context
  const { bass, beatIntensity } = metrics
  const time = Date.now() * 0.001

  const centerX = width / 2
  const centerY = height / 2

  // Number of bars in the circle
  const barCount = 64
  const innerRadius = 100 + bass * 40 + beatIntensity * 20
  const maxBarHeight = 200 + bass * 100

  // Draw outer glow rings
  for (let ring = 3; ring >= 0; ring--) {
    const ringRadius = innerRadius + 250 + ring * 30 + bass * 80
    const ringAlpha = 0.05 - ring * 0.01

    ctx.beginPath()
    ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(74, 158, 255, ${ringAlpha})`
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Draw circular frequency bars
  for (let i = 0; i < barCount; i++) {
    const freqIndex = Math.floor((i / barCount) * bufferLength)
    const amplitude = dataArray[freqIndex] / 255

    const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2 // Start from top
    const barHeight = amplitude * maxBarHeight

    // Mirror bars (draw on both inner and outer)
    const innerX = centerX + innerRadius * Math.cos(angle)
    const innerY = centerY + innerRadius * Math.sin(angle)
    const outerX = centerX + (innerRadius + barHeight) * Math.cos(angle)
    const outerY = centerY + (innerRadius + barHeight) * Math.sin(angle)

    // Bar gradient based on amplitude
    const gradient = ctx.createLinearGradient(innerX, innerY, outerX, outerY)
    gradient.addColorStop(0, `rgba(74, 158, 255, ${0.8 + amplitude * 0.2})`)
    gradient.addColorStop(0.5, getColor(amplitude * 255 + i * 2))
    gradient.addColorStop(1, `rgba(139, 92, 246, ${0.6 + amplitude * 0.4})`)

    ctx.beginPath()
    ctx.moveTo(innerX, innerY)
    ctx.lineTo(outerX, outerY)
    ctx.strokeStyle = gradient
    ctx.lineWidth = (Math.PI * 2 * innerRadius / barCount) * 0.7
    ctx.lineCap = 'round'
    ctx.stroke()

    // Glow effect for high amplitude bars
    if (amplitude > 0.6) {
      ctx.beginPath()
      ctx.moveTo(innerX, innerY)
      ctx.lineTo(outerX, outerY)
      ctx.strokeStyle = `rgba(255, 255, 255, ${(amplitude - 0.6) * 0.5})`
      ctx.lineWidth = (Math.PI * 2 * innerRadius / barCount) * 0.9
      ctx.stroke()
    }
  }

  // Inner mirror bars (pointing inward)
  const innerBarCount = 32
  const innerBarMaxHeight = 50

  for (let i = 0; i < innerBarCount; i++) {
    const freqIndex = Math.floor((i / innerBarCount) * bufferLength)
    const amplitude = dataArray[freqIndex] / 255

    const angle = (i / innerBarCount) * Math.PI * 2 - Math.PI / 2
    const barHeight = amplitude * innerBarMaxHeight

    const outerX = centerX + innerRadius * Math.cos(angle)
    const outerY = centerY + innerRadius * Math.sin(angle)
    const innerX = centerX + (innerRadius - barHeight) * Math.cos(angle)
    const innerY = centerY + (innerRadius - barHeight) * Math.sin(angle)

    ctx.beginPath()
    ctx.moveTo(outerX, outerY)
    ctx.lineTo(innerX, innerY)
    ctx.strokeStyle = `rgba(99, 102, 241, ${0.4 + amplitude * 0.4})`
    ctx.lineWidth = (Math.PI * 2 * (innerRadius - innerBarMaxHeight) / innerBarCount) * 0.5
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  // Center circle with reactive glow
  const centerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius)
  centerGrad.addColorStop(0, `rgba(5, 5, 5, ${0.9 - bass * 0.4})`)
  centerGrad.addColorStop(0.7, `rgba(99, 102, 241, ${0.1 + bass * 0.4})`)
  centerGrad.addColorStop(1, 'transparent')

  ctx.fillStyle = centerGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
  ctx.fill()

  // Pulsing center ring - bass reactive
  ctx.beginPath()
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(74, 158, 255, ${0.3 + bass * 0.7})`
  ctx.lineWidth = 2 + bass * 6
  ctx.stroke()

  // Inner decorative ring
  const innerDecoRadius = innerRadius * 0.6
  ctx.beginPath()
  ctx.arc(centerX, centerY, innerDecoRadius, 0, Math.PI * 2)
  ctx.strokeStyle = `rgba(139, 92, 246, ${0.2 + bass * 0.5})`
  ctx.lineWidth = 1 + bass * 2
  ctx.stroke()

  // Center dot - bass reactive
  const dotSize = 20 + bass * 30
  const dotGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, dotSize)
  dotGrad.addColorStop(0, '#fff')
  dotGrad.addColorStop(0.5, colorScheme.secondary)
  dotGrad.addColorStop(1, 'transparent')

  ctx.fillStyle = dotGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, dotSize, 0, Math.PI * 2)
  ctx.fill()

  // Rotating accent lines - bass reactive
  const accentCount = 8
  for (let i = 0; i < accentCount; i++) {
    const angle = (i / accentCount) * Math.PI * 2 + time * (0.5 + bass)
    const lineStart = innerRadius + maxBarHeight + 20
    const lineEnd = lineStart + 30 + bass * 50

    const x1 = centerX + lineStart * Math.cos(angle)
    const y1 = centerY + lineStart * Math.sin(angle)
    const x2 = centerX + lineEnd * Math.cos(angle)
    const y2 = centerY + lineEnd * Math.sin(angle)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + bass * 0.5})`
    ctx.lineWidth = 2 + bass * 3
    ctx.stroke()
  }

  // Particle burst on bass beat
  if (bass > 0.5) {
    const particleCount = 16 + Math.floor(bass * 16)
    for (let i = 0; i < particleCount; i++) {
      const pAngle = (i / particleCount) * Math.PI * 2 + time
      const pRadius = innerRadius + maxBarHeight + 50 + Math.random() * 80 * bass
      const px = centerX + pRadius * Math.cos(pAngle)
      const py = centerY + pRadius * Math.sin(pAngle)

      ctx.beginPath()
      ctx.arc(px, py, 2 + Math.random() * 4 * bass, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`
      ctx.fill()
    }
  }
}
