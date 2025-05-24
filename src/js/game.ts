import { Renderer } from './renderer';
import { InputHandler } from './input';
import { Track } from './track';
import { Car } from './car';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: Renderer;
  private input: InputHandler;
  private track: Track;
  private car: Car;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly timeStep: number = 1000 / 60; // 60 FPS

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Set canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Initialize game objects
    this.renderer = new Renderer(this.ctx, this.canvas);
    this.input = new InputHandler();
    this.track = new Track(2000); // 2000 segments long track
    this.car = new Car(0, 0, 0);
    
    // Center car on track
    const startPos = this.track.getStartPosition();
    this.car.x = startPos.x;
    this.car.y = startPos.y;
    this.car.angle = startPos.angle;
  }
  
  private resizeCanvas(): void {
    const width = Math.min(window.innerWidth, 1280);
    const height = Math.min(window.innerHeight, 720);
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Update renderer
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }
  
  public start(): void {
    this.lastTime = performance.now();
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }
  
  private gameLoop(timestamp: number): void {
    // Calculate delta time
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    // Accumulate time
    this.accumulator += deltaTime;
    
    // Fixed time step updates
    while (this.accumulator >= this.timeStep) {
      this.update(this.timeStep);
      this.accumulator -= this.timeStep;
    }
    
    // Render
    this.render();
    
    // Next frame
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }
  
  private update(deltaTime: number): void {
    // Update car based on input
    this.car.update(this.input, deltaTime);
    
    // Check collisions with track boundaries
    this.track.checkCollisions(this.car);
  }
  
  private render(): void {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render the track and car
    this.renderer.render(this.track, this.car);
  }
}
