import type { VisualizationContext } from './types'

interface Star {
  x: number
  y: number
  z: number
  size: number
}

let starfieldStars: Star[] = []

export function initStarfield(): void {
  starfieldStars = []
  for (let i = 0; i < 300; i++) {
    starfieldStars.push({
      x: (Math.random() - 0.5) * 3000,
      y: (Math.random() - 0.5) * 3000,
      z: Math.random() * 1000,
      size: 1 + Math.random() * 2,
    })
  }
}

export function drawStarfield(context: VisualizationContext): void {
  const { ctx, width, height, metrics } = context
  const { bass, mid } = metrics

  if (starfieldStars.length < 300) initStarfield()

  const centerX = width / 2
  const centerY = height / 2
  const speed = 5 + bass * 20 + mid * 10

  starfieldStars.forEach(star => {
    // Move star toward viewer
    star.z -= speed

    // Reset if past camera
    if (star.z <= 0) {
      star.z = 1000
      star.x = (Math.random() - 0.5) * width * 3
      star.y = (Math.random() - 0.5) * height * 3
    }

    // Project to 2D
    const scale = 500 / star.z
    const x = centerX + star.x * scale
    const y = centerY + star.y * scale

    if (x < 0 || x > width || y < 0 || y > height) return

    // Draw star with trail
    const trailLength = Math.min(50, speed * 2)
    const prevScale = 500 / (star.z + trailLength)
    const prevX = centerX + star.x * prevScale
    const prevY = centerY + star.y * prevScale

    const brightness = Math.min(1, (1000 - star.z) / 500)
    const size = star.size * scale * (1 + bass)

    // Trail
    ctx.beginPath()
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(x, y)
    ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.5})`
    ctx.lineWidth = size * 0.5
    ctx.stroke()

    // Star
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`
    ctx.fill()
  })

  // Center glow
  const glowSize = 100 + bass * 100
  const glowGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize)
  glowGrad.addColorStop(0, `rgba(139, 92, 246, ${0.3 + bass * 0.3})`)
  glowGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = glowGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2)
  ctx.fill()
}
