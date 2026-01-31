import {
  vertexShaderSource,
  thresholdShaderSource,
  blurShaderSource,
  combineShaderSource,
  finalShaderSource,
  passthroughShaderSource,
} from './shaders'
import type { FXEffects, PostProcessorConfig } from '@/types'

interface Framebuffer {
  framebuffer: WebGLFramebuffer
  texture: WebGLTexture
  width: number
  height: number
}

export class PostProcessor {
  private gl: WebGLRenderingContext | null = null
  private sourceCanvas: HTMLCanvasElement | null = null
  private postCanvas: HTMLCanvasElement | null = null
  private sourceTexture: WebGLTexture | null = null
  private pingPongFBOs: Framebuffer[] = []
  private bloomFBOs: Framebuffer[] = []
  private quadVBO: WebGLBuffer | null = null
  private shaders: Record<string, WebGLProgram | null> = {}
  private webglSupported = true

  effects: FXEffects = {
    enabled: true,
    bloom: true,
    chromatic: true,
    vignette: true,
    grain: true,
    colorGrade: true,
    audioReactive: true,
  }

  config: PostProcessorConfig = {
    bloomThreshold: 0.6,
    bloomIntensity: 0.8,
    bloomRadius: 4,
    chromaticStrength: 0.003,
    vignetteStrength: 0.4,
    grainStrength: 0.08,
    saturation: 1.15,
    contrast: 1.1,
  }

  init(sourceCanvas: HTMLCanvasElement, postCanvas: HTMLCanvasElement): boolean {
    this.sourceCanvas = sourceCanvas
    this.postCanvas = postCanvas

    try {
      this.gl = postCanvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        antialias: false,
      })

      if (!this.gl) {
        console.warn('WebGL not supported, post-processing disabled')
        this.webglSupported = false
        postCanvas.style.display = 'none'
        return false
      }
    } catch (e) {
      console.warn('WebGL initialization failed:', e)
      this.webglSupported = false
      postCanvas.style.display = 'none'
      return false
    }

    // Compile shaders
    this.shaders.threshold = this.createProgram(vertexShaderSource, thresholdShaderSource)
    this.shaders.blur = this.createProgram(vertexShaderSource, blurShaderSource)
    this.shaders.combine = this.createProgram(vertexShaderSource, combineShaderSource)
    this.shaders.final = this.createProgram(vertexShaderSource, finalShaderSource)
    this.shaders.passthrough = this.createProgram(vertexShaderSource, passthroughShaderSource)

    if (!this.shaders.threshold || !this.shaders.blur || !this.shaders.combine || !this.shaders.final || !this.shaders.passthrough) {
      console.error('Failed to compile shaders')
      this.webglSupported = false
      postCanvas.style.display = 'none'
      return false
    }

    // Create fullscreen quad
    const quadVertices = new Float32Array([
      -1, -1, 0, 0,
       1, -1, 1, 0,
      -1,  1, 0, 1,
       1,  1, 1, 1,
    ])
    this.quadVBO = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVBO)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, quadVertices, this.gl.STATIC_DRAW)

    // Create source texture
    this.sourceTexture = this.gl.createTexture()
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.sourceTexture)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)

    // Setup framebuffers
    this.resizeFramebuffers()

    console.log('PostProcessor initialized successfully')
    return true
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null

    const shader = this.gl.createShader(type)
    if (!shader) return null

    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader))
      this.gl.deleteShader(shader)
      return null
    }
    return shader
  }

  private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram | null {
    if (!this.gl) return null

    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource)
    if (!vertexShader || !fragmentShader) return null

    const program = this.gl.createProgram()
    if (!program) return null

    this.gl.attachShader(program, vertexShader)
    this.gl.attachShader(program, fragmentShader)
    this.gl.linkProgram(program)

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(program))
      return null
    }
    return program
  }

  private createFramebuffer(width: number, height: number): Framebuffer | null {
    if (!this.gl) return null

    const fbo = this.gl.createFramebuffer()
    if (!fbo) return null
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo)

    const texture = this.gl.createTexture()
    if (!texture) return null
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)

    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture, 0)
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)

    return { framebuffer: fbo, texture, width, height }
  }

  private resizeFramebuffers(): void {
    if (!this.gl || !this.webglSupported || !this.postCanvas) return

    const w = this.postCanvas.width
    const h = this.postCanvas.height
    const halfW = Math.floor(w / 2)
    const halfH = Math.floor(h / 2)

    // Cleanup old FBOs
    this.pingPongFBOs.forEach(fbo => {
      this.gl!.deleteFramebuffer(fbo.framebuffer)
      this.gl!.deleteTexture(fbo.texture)
    })
    this.bloomFBOs.forEach(fbo => {
      this.gl!.deleteFramebuffer(fbo.framebuffer)
      this.gl!.deleteTexture(fbo.texture)
    })

    // Full resolution FBOs for ping-pong
    const fbo1 = this.createFramebuffer(w, h)
    const fbo2 = this.createFramebuffer(w, h)
    if (fbo1 && fbo2) {
      this.pingPongFBOs = [fbo1, fbo2]
    }

    // Half resolution FBOs for bloom (better performance)
    const bloomFbo1 = this.createFramebuffer(halfW, halfH)
    const bloomFbo2 = this.createFramebuffer(halfW, halfH)
    if (bloomFbo1 && bloomFbo2) {
      this.bloomFBOs = [bloomFbo1, bloomFbo2]
    }
  }

  resize(): void {
    if (!this.postCanvas || !this.webglSupported) return

    this.postCanvas.width = window.innerWidth
    this.postCanvas.height = window.innerHeight

    if (this.gl) {
      this.gl.viewport(0, 0, this.postCanvas.width, this.postCanvas.height)
      this.resizeFramebuffers()
    }
  }

  private setupQuadAttribs(program: WebGLProgram): void {
    if (!this.gl || !this.quadVBO) return

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVBO)
    const posLoc = this.gl.getAttribLocation(program, 'a_position')
    const texLoc = this.gl.getAttribLocation(program, 'a_texCoord')
    this.gl.enableVertexAttribArray(posLoc)
    this.gl.enableVertexAttribArray(texLoc)
    this.gl.vertexAttribPointer(posLoc, 2, this.gl.FLOAT, false, 16, 0)
    this.gl.vertexAttribPointer(texLoc, 2, this.gl.FLOAT, false, 16, 8)
  }

  private renderBloom(sourceTexture: WebGLTexture): WebGLTexture | null {
    if (!this.gl || this.bloomFBOs.length < 2) return null

    const halfW = this.bloomFBOs[0].width
    const halfH = this.bloomFBOs[0].height
    const threshold = this.shaders.threshold
    const blur = this.shaders.blur

    if (!threshold || !blur) return null

    // 1. Threshold extraction
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.bloomFBOs[0].framebuffer)
    this.gl.viewport(0, 0, halfW, halfH)
    this.gl.useProgram(threshold)
    this.setupQuadAttribs(threshold)

    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, sourceTexture)
    this.gl.uniform1i(this.gl.getUniformLocation(threshold, 'u_texture'), 0)
    this.gl.uniform1f(this.gl.getUniformLocation(threshold, 'u_threshold'), this.config.bloomThreshold)
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)

    // 2. Multiple blur passes
    this.gl.useProgram(blur)
    this.setupQuadAttribs(blur)
    this.gl.uniform2f(this.gl.getUniformLocation(blur, 'u_resolution'), halfW, halfH)

    for (let i = 0; i < this.config.bloomRadius; i++) {
      // Horizontal blur
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.bloomFBOs[1].framebuffer)
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.bloomFBOs[0].texture)
      this.gl.uniform1i(this.gl.getUniformLocation(blur, 'u_texture'), 0)
      this.gl.uniform2f(this.gl.getUniformLocation(blur, 'u_direction'), 1.0, 0.0)
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)

      // Vertical blur
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.bloomFBOs[0].framebuffer)
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.bloomFBOs[1].texture)
      this.gl.uniform2f(this.gl.getUniformLocation(blur, 'u_direction'), 0.0, 1.0)
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
    }

    return this.bloomFBOs[0].texture
  }

  render(time: number, bassLevel: number): void {
    if (!this.gl || !this.webglSupported || !this.effects.enabled || !this.postCanvas || !this.sourceCanvas || !this.sourceTexture) {
      if (this.postCanvas) {
        this.postCanvas.style.opacity = this.effects.enabled && this.webglSupported ? '1' : '0'
      }
      return
    }

    this.postCanvas.style.opacity = '1'
    const w = this.postCanvas.width
    const h = this.postCanvas.height

    // Update source texture from 2D canvas
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.sourceTexture)
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.sourceCanvas)

    let currentTexture: WebGLTexture = this.sourceTexture

    // Bloom pass
    if (this.effects.bloom && this.pingPongFBOs.length >= 2) {
      const bloomTexture = this.renderBloom(this.sourceTexture)
      const combine = this.shaders.combine

      if (bloomTexture && combine) {
        // Combine original with bloom
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.pingPongFBOs[0].framebuffer)
        this.gl.viewport(0, 0, w, h)
        this.gl.useProgram(combine)
        this.setupQuadAttribs(combine)

        this.gl.activeTexture(this.gl.TEXTURE0)
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.sourceTexture)
        this.gl.uniform1i(this.gl.getUniformLocation(combine, 'u_original'), 0)

        this.gl.activeTexture(this.gl.TEXTURE1)
        this.gl.bindTexture(this.gl.TEXTURE_2D, bloomTexture)
        this.gl.uniform1i(this.gl.getUniformLocation(combine, 'u_bloom'), 1)

        const bloomIntensity = this.effects.audioReactive
          ? this.config.bloomIntensity * (1.0 + bassLevel * 0.5)
          : this.config.bloomIntensity
        this.gl.uniform1f(this.gl.getUniformLocation(combine, 'u_bloomIntensity'), bloomIntensity)
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)

        currentTexture = this.pingPongFBOs[0].texture
      }
    }

    // Final effects pass (render to screen)
    const final = this.shaders.final
    if (!final) return

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
    this.gl.viewport(0, 0, w, h)
    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)

    this.gl.useProgram(final)
    this.setupQuadAttribs(final)

    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, currentTexture)
    this.gl.uniform1i(this.gl.getUniformLocation(final, 'u_texture'), 0)

    this.gl.uniform1f(this.gl.getUniformLocation(final, 'u_time'), time * 0.001)
    this.gl.uniform1f(this.gl.getUniformLocation(final, 'u_bassLevel'), bassLevel)
    this.gl.uniform2f(this.gl.getUniformLocation(final, 'u_resolution'), w, h)

    this.gl.uniform1f(this.gl.getUniformLocation(final, 'u_chromaticStrength'), this.config.chromaticStrength)
    this.gl.uniform1f(this.gl.getUniformLocation(final, 'u_vignetteStrength'), this.config.vignetteStrength)
    this.gl.uniform1f(this.gl.getUniformLocation(final, 'u_grainStrength'), this.config.grainStrength)
    this.gl.uniform1f(this.gl.getUniformLocation(final, 'u_saturation'), this.config.saturation)
    this.gl.uniform1f(this.gl.getUniformLocation(final, 'u_contrast'), this.config.contrast)

    this.gl.uniform1i(this.gl.getUniformLocation(final, 'u_chromaticEnabled'), this.effects.chromatic ? 1 : 0)
    this.gl.uniform1i(this.gl.getUniformLocation(final, 'u_vignetteEnabled'), this.effects.vignette ? 1 : 0)
    this.gl.uniform1i(this.gl.getUniformLocation(final, 'u_grainEnabled'), this.effects.grain ? 1 : 0)
    this.gl.uniform1i(this.gl.getUniformLocation(final, 'u_colorGradeEnabled'), this.effects.colorGrade ? 1 : 0)
    this.gl.uniform1i(this.gl.getUniformLocation(final, 'u_audioReactive'), this.effects.audioReactive ? 1 : 0)

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
  }

  setEnabled(value: boolean): void {
    this.effects.enabled = value
    if (this.postCanvas) {
      this.postCanvas.style.opacity = value && this.webglSupported ? '1' : '0'
    }
  }

  setEffect(name: keyof Omit<FXEffects, 'enabled'>, value: boolean): void {
    this.effects[name] = value
  }

  isSupported(): boolean {
    return this.webglSupported
  }

  destroy(): void {
    if (this.gl) {
      // Cleanup textures and framebuffers
      if (this.sourceTexture) {
        this.gl.deleteTexture(this.sourceTexture)
      }
      this.pingPongFBOs.forEach(fbo => {
        this.gl!.deleteFramebuffer(fbo.framebuffer)
        this.gl!.deleteTexture(fbo.texture)
      })
      this.bloomFBOs.forEach(fbo => {
        this.gl!.deleteFramebuffer(fbo.framebuffer)
        this.gl!.deleteTexture(fbo.texture)
      })
      if (this.quadVBO) {
        this.gl.deleteBuffer(this.quadVBO)
      }
      // Delete shader programs
      Object.values(this.shaders).forEach(program => {
        if (program) this.gl!.deleteProgram(program)
      })
    }
  }
}
