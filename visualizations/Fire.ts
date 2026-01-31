import type { VisualizationContext } from './types'

interface FireParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  decay: number
  heat: number
}

let fireParticles: FireParticle[] = []

export function drawFire(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, bufferLength, metrics } = context
  const { bass, high } = metrics
  const time = Date.now() * 0.001

  // Dark background
  ctx.fillStyle = '#050200'
  ctx.fillRect(0, 0, width, height)

  // Spawn fire particles
  const spawnRate = 8 + Math.floor(bass * 15)
  for (let i = 0; i < spawnRate; i++) {
    const freqIndex = Math.floor((i / spawnRate) * bufferLength)
    const amplitude = dataArray[freqIndex] / 255

    const spawnX = width * 0.35 + Math.random() * width * 0.3
    fireParticles.push({
      x: spawnX,
      y: height - 50,
      vx: (Math.random() - 0.5) * 3,
      vy: -4 - Math.random() * 4 - amplitude * 5,
      size: 15 + Math.random() * 25 + amplitude * 20,
      life: 1.0,
      decay: 0.015 + Math.random() * 0.01,
      heat: 1.0,
    })
  }

  // Update and draw fire
  for (let i = fireParticles.length - 1; i >= 0; i--) {
    const p = fireParticles[i]

    // Turbulent rise
    p.vx += (Math.random() - 0.5) * 0.5 + Math.sin(time * 3 + p.y * 0.05) * 0.2
    p.vx *= 0.95
    p.vy *= 0.99

    p.x += p.vx
    p.y += p.vy
    p.life -= p.decay
    p.heat = p.life // Cool as it rises
    p.size *= 0.98 // Shrink slightly

    if (p.life <= 0) {
      fireParticles.splice(i, 1)
      continue
    }

    // Fire color based on heat
    let r: number, g: number, b: number
    if (p.heat > 0.7) {
      // Yellow-white core
      r = 255
      g = 200 + p.heat * 55
      b = 100 * p.heat
    } else if (p.heat > 0.4) {
      // Orange
      r = 255
      g = 100 + p.heat * 150
      b = 0
    } else {
      // Red
      r = 200 + p.heat * 55
      g = p.heat * 100
      b = 0
    }

    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.life * 0.8})`)
    gradient.addColorStop(0.4, `rgba(${r * 0.8}, ${g * 0.5}, 0, ${p.life * 0.5})`)
    gradient.addColorStop(1, 'transparent')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }

  // Limit particles
  if (fireParticles.length > 300) {
    fireParticles = fireParticles.slice(-300)
  }

  // Ember sparks
  if (bass > 0.4 || high > 0.5) {
    for (let i = 0; i < 5 + bass * 10; i++) {
      const x = width * 0.35 + Math.random() * width * 0.3
      const y = height - 100 - Math.random() * 200
      ctx.fillStyle = `rgba(255, ${150 + Math.random() * 105}, 0, ${0.5 + Math.random() * 0.5})`
      ctx.beginPath()
      ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Base glow
  const baseGlow = ctx.createRadialGradient(width / 2, height, 0, width / 2, height, 300 + bass * 150)
  baseGlow.addColorStop(0, `rgba(255, 100, 0, ${0.4 + bass * 0.3})`)
  baseGlow.addColorStop(0.5, `rgba(255, 50, 0, ${0.2 + bass * 0.2})`)
  baseGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = baseGlow
  ctx.fillRect(0, height - 300, width, 300)
}
