import type { VisualizationContext } from './types'

export function drawNova(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, bufferLength, metrics, colorScheme, getColor } = context
  const { bass } = metrics
  const time = Date.now() * 0.001

  const centerX = width / 2
  const centerY = height / 2

  // Gentle rays - slower rotation, less reactive
  const rayCount = 48
  for (let i = 0; i < rayCount; i++) {
    const freqIndex = Math.floor((i / rayCount) * bufferLength)
    const amplitude = dataArray[freqIndex] / 255

    const angle = (i / rayCount) * Math.PI * 2 + time * 0.004
    const length = 79 + amplitude * 238 + bass * 79
    const rayWidth = 2 + amplitude * 7.9 + bass * 4

    const endX = centerX + length * Math.cos(angle)
    const endY = centerY + length * Math.sin(angle)

    // Ray gradient
    const gradient = ctx.createLinearGradient(centerX, centerY, endX, endY)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
    gradient.addColorStop(0.3, getColor(i * 5 + amplitude * 100))
    gradient.addColorStop(1, 'transparent')

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(endX, endY)
    ctx.strokeStyle = gradient
    ctx.lineWidth = rayWidth
    ctx.lineCap = 'round'
    ctx.stroke()

    // Particle at end
    if (amplitude > 0.47) {
      ctx.beginPath()
      ctx.arc(endX, endY, 2.6 + amplitude * 5.3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + amplitude * 0.3})`
      ctx.fill()
    }
  }

  // Secondary spinning layer
  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(-time * 0.0053)

  const innerRays = 24
  for (let i = 0; i < innerRays; i++) {
    const freqIndex = Math.floor((i / innerRays) * bufferLength)
    const amplitude = dataArray[freqIndex] / 255

    const angle = (i / innerRays) * Math.PI * 2
    const length = 53 + amplitude * 106

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(length * Math.cos(angle), length * Math.sin(angle))
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.26 + amplitude * 0.4})`
    ctx.lineWidth = 1.3 + amplitude * 2.6
    ctx.stroke()
  }

  ctx.restore()

  // Core glow
  const coreSize = 53 + bass * 33
  const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize)
  coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
  coreGrad.addColorStop(0.3, colorScheme.primary)
  coreGrad.addColorStop(0.6, colorScheme.secondary)
  coreGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = coreGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2)
  ctx.fill()
}
