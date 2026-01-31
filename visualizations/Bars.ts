import type { VisualizationContext } from './types'
import { rotatePoint, project3D } from '@/lib/utils/projection'

interface BarData {
  x1: number
  y1: number
  x2: number
  y2: number
  z: number
  amplitude: number
  freqIndex: number
}

export function drawBars(context: VisualizationContext): void {
  const { ctx, width, height, dataArray, bufferLength, metrics, rotation, getColor } = context
  const { bass } = metrics

  const centerX = width / 2
  const centerY = height / 2
  const bars = 64
  const barWidth = 8 + bass * 4
  const maxHeight = Math.min(width, height) * 0.35 * (1 + bass * 0.3)

  const barData: BarData[] = []

  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2
    const freqIndex = Math.floor(i * bufferLength / bars)
    const amplitude = dataArray[freqIndex] / 255
    const barHeight = amplitude * maxHeight

    const innerRadius = 80 + bass * 30
    const outerRadius = innerRadius + barHeight

    // Inner point
    const x1 = innerRadius * Math.cos(angle)
    const z1 = innerRadius * Math.sin(angle)

    // Outer point
    const x2 = outerRadius * Math.cos(angle)
    const z2 = outerRadius * Math.sin(angle)

    const rotated1 = rotatePoint(x1, 0, z1, rotation.x, rotation.y)
    const rotated2 = rotatePoint(x2, 0, z2, rotation.x, rotation.y)

    const p1 = project3D(rotated1.x, rotated1.y, rotated1.z, centerX, centerY, 500, width, height)
    const p2 = project3D(rotated2.x, rotated2.y, rotated2.z, centerX, centerY, 500, width, height)

    // Skip if both endpoints are culled
    if (p1.culled && p2.culled) continue

    barData.push({
      x1: p1.x, y1: p1.y,
      x2: p2.x, y2: p2.y,
      z: (rotated1.z + rotated2.z) / 2,
      amplitude,
      freqIndex,
    })
  }

  barData.sort((a, b) => a.z - b.z)

  barData.forEach(bar => {
    const gradient = ctx.createLinearGradient(bar.x1, bar.y1, bar.x2, bar.y2)
    gradient.addColorStop(0, 'rgba(0, 247, 255, 0.3)')
    gradient.addColorStop(0.5, getColor(bar.amplitude * 255))
    gradient.addColorStop(1, getColor(bar.amplitude * 255, 60))

    ctx.strokeStyle = gradient
    ctx.lineWidth = barWidth * (0.5 + bar.amplitude * 0.5)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(bar.x1, bar.y1)
    ctx.lineTo(bar.x2, bar.y2)
    ctx.stroke()
  })
}
