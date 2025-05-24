# Racing Legends

A retro-style 2.5D racing game inspired by classic PS1 racing games, built with TypeScript and HTML5 Canvas.

![Racing Legends Screenshot](screenshot.png)

## Features

- PS1-style 2.5D graphics with affine texture mapping
- Procedurally generated tracks
- Smooth 60fps gameplay
- Responsive controls (keyboard and touch)
- No textures or external assets - everything is drawn with code

## Controls

- **Arrow Up**: Accelerate
- **Arrow Down**: Brake/Reverse
- **Arrow Left/Right**: Steer
- **On mobile**: Use the on-screen touch controls

## Development

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the game locally

To start the development server:

```bash
npm start
```

Then open your browser to `http://localhost:8080`

### Building for production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Deploying to GitHub Pages

1. Make sure you have committed all your changes:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

2. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

3. Your game will be available at: `https://your-username.github.io/racing-legends`

## Development Scripts

- `npm start`: Start development server
- `npm run build`: Create production build
- `npm run deploy`: Deploy to GitHub Pages
- `npm run watch`: Watch for changes and rebuild

## Project Structure

- `src/js/`: TypeScript source files
  - `main.ts`: Entry point
  - `game.ts`: Main game class
  - `car.ts`: Car physics and controls
  - `track.ts`: Track generation and rendering
  - `renderer.ts`: Rendering logic
  - `camera.ts`: Camera controls
  - `input.ts`: Input handling
  - `utils.ts`: Utility functions
- `src/index.html`: Main HTML file
- `webpack.*.js`: Webpack configuration files
- `tsconfig.json`: TypeScript configuration

## How it works

The game uses a combination of 2D canvas rendering techniques to create a 3D-like effect:

1. **Track Generation**: Tracks are procedurally generated with curves and elevation changes
2. **Rendering**: Uses a pseudo-3D projection to create the illusion of depth
3. **Physics**: Simple physics for car movement and collision detection
4. **Controls**: Responsive input handling for both keyboard and touch devices

## License

MIT
