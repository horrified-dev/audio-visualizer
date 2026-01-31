import type { VisualizationContext } from './types'

export function drawNeonGrid(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, bufferLength, metrics } = context
  const { bass, mid } = metrics
  const time = Date.now() * 0.001

  const centerX = width / 2
  const horizonY = height * 0.5

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY)
  skyGrad.addColorStop(0, '#0a0015')
  skyGrad.addColorStop(1, '#1a0030')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, width, horizonY)

  // Sun
  const sunY = horizonY - 50 - bass * 30
  const sunGrad = ctx.createRadialGradient(centerX, sunY, 0, centerX, sunY, 120 + bass * 40)
  sunGrad.addColorStop(0, '#ff6b35')
  sunGrad.addColorStop(0.4, '#ff2d95')
  sunGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = sunGrad
  ctx.beginPath()
  ctx.arc(centerX, sunY, 120 + bass * 40, 0, Math.PI * 2)
  ctx.fill()

  // Horizontal sun lines
  ctx.strokeStyle = '#0a0015'
  ctx.lineWidth = 4
  for (let i = 0; i < 8; i++) {
    const ly = sunY - 60 + i * 15
    if (ly > sunY - 100 && ly < sunY + 100) {
      ctx.beginPath()
      ctx.moveTo(centerX - 150, ly)
      ctx.lineTo(centerX + 150, ly)
      ctx.stroke()
    }
  }

  // Grid floor
  const gridLines = 20
  const scrollSpeed = time * (2 + bass * 3)

  // Horizontal lines (depth)
  for (let i = 0; i < gridLines; i++) {
    const freqIndex = Math.floor((i / gridLines) * bufferLength)
    const amplitude = dataArray[freqIndex] / 255

    const t = ((i / gridLines + scrollSpeed * 0.1) % 1)
    const y = horizonY + Math.pow(t, 1.5) * (height - horizonY)
    const alpha = t * (0.5 + amplitude * 0.5)

    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.strokeStyle = `rgba(255, 45, 149, ${alpha})`
    ctx.lineWidth = 1 + amplitude * 2
    ctx.stroke()
  }

  // Vertical lines (perspective)
  const vLines = 30
  for (let i = 0; i <= vLines; i++) {
    const freqIndex = Math.floor((i / vLines) * bufferLength)
    const amplitude = dataArray[freqIndex] / 255

    const xRatio = i / vLines
    const topX = width * xRatio
    const bottomX = centerX + (topX - centerX) * 3

    ctx.beginPath()
    ctx.moveTo(topX, horizonY)
    ctx.lineTo(bottomX, height)
    ctx.strokeStyle = `rgba(0, 247, 255, ${0.3 + amplitude * 0.5})`
    ctx.lineWidth = 1 + amplitude * 2
    ctx.stroke()
  }

  // Audio-reactive mountains
  ctx.beginPath()
  ctx.moveTo(0, horizonY)
  for (let x = 0; x <= width; x += 20) {
    const freqIndex = Math.floor((x / width) * bufferLength)
    const amplitude = dataArray[freqIndex] / 255
    const mountainY = horizonY - 20 - amplitude * 100 - Math.sin(x * 0.02 + time) * 20
    ctx.lineTo(x, mountainY)
  }
  ctx.lineTo(width, horizonY)
  ctx.closePath()
  ctx.fillStyle = '#1a0030'
  ctx.fill()
  ctx.strokeStyle = '#ff2d95'
  ctx.lineWidth = 2
  ctx.stroke()
}
