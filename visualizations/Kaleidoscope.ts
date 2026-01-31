import type { VisualizationContext } from './types'

export function drawKaleidoscope(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, bufferLength, metrics, rotation, colorScheme, getColor } = context
  const { bass, average } = metrics

  const centerX = width / 2
  const centerY = height / 2
  const segments = 10
  const layers = 5

  ctx.save()
  ctx.translate(centerX, centerY)

  for (let layer = 0; layer < layers; layer++) {
    const layerRadius = (50 + layer * 60) * (1 + bass * 0.4)

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2 + rotation.y + bass * 0.2
      const freqIndex = Math.floor((i + layer * segments) % bufferLength)
      const amplitude = dataArray[freqIndex] / 255

      ctx.save()
      ctx.rotate(angle)

      const radiusMod = layerRadius * (1 + amplitude * 0.3 + bass * 0.2)
      const petalWidth = (Math.PI * 2 / segments) * 0.8

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.quadraticCurveTo(
        radiusMod * 0.5, -radiusMod * Math.tan(petalWidth / 2),
        radiusMod, 0
      )
      ctx.quadraticCurveTo(
        radiusMod * 0.5, radiusMod * Math.tan(petalWidth / 2),
        0, 0
      )

      const gradient = ctx.createLinearGradient(0, 0, radiusMod, 0)
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(0.5, getColor(layer * 40 + i * 20 + amplitude * 100))
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.fill()

      ctx.strokeStyle = getColor(layer * 40 + i * 20)
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.restore()
    }
  }

  // Center glow - bass reactive
  const centerSize = 80 + bass * 60 + average * 40
  const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, centerSize)
  centerGrad.addColorStop(0, '#fff')
  centerGrad.addColorStop(0.3, colorScheme.primary)
  centerGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = centerGrad
  ctx.beginPath()
  ctx.arc(0, 0, centerSize, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}
