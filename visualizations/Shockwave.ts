import type { VisualizationContext } from './types'

interface Shockwave {
  radius: number
  maxRadius: number
  speed: number
  alpha: number
  hue: number
  thickness: number
}

let shockwaves: Shockwave[] = []
let lastBeatTime = 0

export function drawShockwave(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, bufferLength, metrics, colorScheme } = context
  const { bass, isBeat } = metrics

  const centerX = width / 2
  const centerY = height / 2
  const currentTime = Date.now()

  // Spawn new shockwave on bass beat
  if (isBeat && currentTime - lastBeatTime > 80) {
    lastBeatTime = currentTime
    shockwaves.push({
      radius: 20,
      maxRadius: 500 + bass * 400,
      speed: 10 + bass * 25,
      alpha: 1,
      hue: Math.random() * 360,
      thickness: 5 + bass * 15,
    })
  }

  // Update and draw shockwaves
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const wave = shockwaves[i]
    wave.radius += wave.speed
    wave.alpha = 1 - (wave.radius / wave.maxRadius)

    if (wave.alpha <= 0) {
      shockwaves.splice(i, 1)
      continue
    }

    // Main ring
    ctx.beginPath()
    ctx.arc(centerX, centerY, wave.radius, 0, Math.PI * 2)
    ctx.strokeStyle = `hsla(${wave.hue}, 100%, 60%, ${wave.alpha})`
    ctx.lineWidth = wave.thickness * wave.alpha
    ctx.stroke()

    // Inner glow
    ctx.beginPath()
    ctx.arc(centerX, centerY, wave.radius * 0.95, 0, Math.PI * 2)
    ctx.strokeStyle = `hsla(${wave.hue + 30}, 100%, 80%, ${wave.alpha * 0.5})`
    ctx.lineWidth = wave.thickness * 0.5 * wave.alpha
    ctx.stroke()

    // Distortion segments
    const segments = 32
    for (let j = 0; j < segments; j++) {
      const angle = (j / segments) * Math.PI * 2
      const freqIndex = Math.floor((j / segments) * bufferLength)
      const amp = dataArray[freqIndex] / 255
      const wobble = amp * 30

      const x1 = centerX + (wave.radius - wobble) * Math.cos(angle)
      const y1 = centerY + (wave.radius - wobble) * Math.sin(angle)
      const x2 = centerX + (wave.radius + wobble) * Math.cos(angle)
      const y2 = centerY + (wave.radius + wobble) * Math.sin(angle)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = `hsla(${wave.hue}, 100%, 70%, ${wave.alpha * amp})`
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  // Center pulse - bass reactive
  const pulseSize = 30 + bass * 50
  const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize)
  coreGrad.addColorStop(0, '#fff')
  coreGrad.addColorStop(0.5, colorScheme.primary)
  coreGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = coreGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2)
  ctx.fill()
}
