# Audio Visualizer

A real-time audio visualizer built with Next.js 15, React 19, and Canvas API.

## Features

- **15 Visualization Modes**: Sphere, Bars, Particles, Helix, Kaleidoscope, Tunnel, Vortex, Trapnation, Shockwave, Nova, Bass Ring, Galaxy, Neon Grid, Starfield, and Fire
- **Post-Processing Effects**: Bloom, chromatic aberration, vignette, film grain, and color grading
- **Audio-Reactive**: All effects respond dynamically to bass, mid, and high frequencies
- **Multiple Color Schemes**: Switch between different color palettes on the fly

## Requirements

- Node.js 18.17 or later
- A modern browser with Web Audio API support (Chrome, Firefox, Edge, Safari)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/horrified-dev/audio-visualizer.git
   cd audio-visualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click "Start" on the welcome screen
2. Select an audio input device (microphone or system audio)
3. Grant microphone permissions when prompted
4. Use the controls to:
   - Switch between visualization modes
   - Toggle post-processing effects
   - Change color schemes

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS
- **State Management**: Zustand 5
- **Rendering**: Canvas 2D API with custom post-processing

## Browser Permissions

The visualizer requires microphone access to capture audio. When prompted:
- Click "Allow" to grant microphone permission
- For system audio capture, you may need to use a virtual audio device or browser extension

## License

MIT
