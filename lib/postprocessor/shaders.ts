// Vertex shader - fullscreen quad
export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`

// Threshold shader - extract bright areas for bloom
export const thresholdShaderSource = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_threshold;
  varying vec2 v_texCoord;
  void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    if (brightness > u_threshold) {
      gl_FragColor = color * (brightness - u_threshold) / (1.0 - u_threshold);
    } else {
      gl_FragColor = vec4(0.0);
    }
  }
`

// Gaussian blur shader - 9-tap separable
export const blurShaderSource = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform vec2 u_direction;
  uniform vec2 u_resolution;
  varying vec2 v_texCoord;
  void main() {
    vec2 texelSize = 1.0 / u_resolution;
    vec4 result = texture2D(u_texture, v_texCoord) * 0.227027;
    result += texture2D(u_texture, v_texCoord + u_direction * texelSize * 2.0) * 0.1945946;
    result += texture2D(u_texture, v_texCoord - u_direction * texelSize * 2.0) * 0.1945946;
    result += texture2D(u_texture, v_texCoord + u_direction * texelSize * 4.0) * 0.1216216;
    result += texture2D(u_texture, v_texCoord - u_direction * texelSize * 4.0) * 0.1216216;
    result += texture2D(u_texture, v_texCoord + u_direction * texelSize * 6.0) * 0.054054;
    result += texture2D(u_texture, v_texCoord - u_direction * texelSize * 6.0) * 0.054054;
    result += texture2D(u_texture, v_texCoord + u_direction * texelSize * 8.0) * 0.016216;
    result += texture2D(u_texture, v_texCoord - u_direction * texelSize * 8.0) * 0.016216;
    gl_FragColor = result;
  }
`

// Combine shader - add bloom back to original
export const combineShaderSource = `
  precision mediump float;
  uniform sampler2D u_original;
  uniform sampler2D u_bloom;
  uniform float u_bloomIntensity;
  varying vec2 v_texCoord;
  void main() {
    vec4 original = texture2D(u_original, v_texCoord);
    vec4 bloom = texture2D(u_bloom, v_texCoord);
    gl_FragColor = original + bloom * u_bloomIntensity;
  }
`

// Final shader - all post effects
export const finalShaderSource = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_time;
  uniform float u_bassLevel;
  uniform vec2 u_resolution;
  uniform float u_chromaticStrength;
  uniform float u_vignetteStrength;
  uniform float u_grainStrength;
  uniform float u_saturation;
  uniform float u_contrast;
  uniform int u_chromaticEnabled;
  uniform int u_vignetteEnabled;
  uniform int u_grainEnabled;
  uniform int u_colorGradeEnabled;
  uniform int u_audioReactive;
  varying vec2 v_texCoord;

  // Pseudo-random function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = v_texCoord;
    vec4 color;

    // Audio reactive pulse
    float pulse = (u_audioReactive == 1) ? u_bassLevel * 0.5 : 0.0;

    // Chromatic aberration
    if (u_chromaticEnabled == 1) {
      float strength = u_chromaticStrength * (1.0 + pulse * 2.0);
      vec2 dir = uv - 0.5;
      float dist = length(dir);
      vec2 offset = dir * dist * strength;
      color.r = texture2D(u_texture, uv + offset).r;
      color.g = texture2D(u_texture, uv).g;
      color.b = texture2D(u_texture, uv - offset).b;
      color.a = 1.0;
    } else {
      color = texture2D(u_texture, uv);
    }

    // Color grading
    if (u_colorGradeEnabled == 1) {
      // Saturation
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      color.rgb = mix(vec3(gray), color.rgb, u_saturation);

      // Contrast
      color.rgb = (color.rgb - 0.5) * u_contrast + 0.5;

      // Slight warm shift on highlights
      color.r += color.r * 0.05;
      color.b -= color.b * 0.02;
    }

    // Vignette
    if (u_vignetteEnabled == 1) {
      vec2 vignetteUV = uv * (1.0 - uv.yx);
      float vignette = vignetteUV.x * vignetteUV.y * 15.0;
      vignette = pow(vignette, u_vignetteStrength * (1.0 - pulse * 0.3));
      color.rgb *= vignette;
    }

    // Film grain
    if (u_grainEnabled == 1) {
      float grain = random(uv * u_time) * 2.0 - 1.0;
      color.rgb += grain * u_grainStrength;
    }

    // Clamp output
    gl_FragColor = clamp(color, 0.0, 1.0);
  }
`

// Passthrough shader for when bloom is disabled
export const passthroughShaderSource = `
  precision mediump float;
  uniform sampler2D u_texture;
  varying vec2 v_texCoord;
  void main() {
    gl_FragColor = texture2D(u_texture, v_texCoord);
  }
`
