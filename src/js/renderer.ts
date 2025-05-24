import { Track, TrackSegment } from './track';
import { Car } from './car';

// Camera settings
interface Camera {
  height: number;      // Camera height from ground
  distance: number;    // View distance
  fieldOfView: number; // Field of view in degrees
  fogDensity: number;  // How quickly fog increases with distance
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private horizon: number;
  private camera: Camera;
  private lastFrameTime: number = 0;
  private fps: number = 0;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  
  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.horizon = this.height * 0.4;
    
    // Camera configuration
    this.camera = {
      height: 1000,        // Height of camera above track
      distance: 0.8,       // How far ahead the camera looks (0-1)
      fieldOfView: 100,    // Field of view in degrees
      fogDensity: 5        // Fog density (higher = more fog)
    };
    
    // Set up canvas rendering context
    this.ctx.imageSmoothingEnabled = false;
  }
  
  public setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.horizon = this.height * 0.4;
  }
  
  public render(track: Track, car: Car): void {
    // Calculate FPS
    const now = performance.now();
    this.frameCount++;
    
    if (now - this.lastFpsUpdate > 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
    
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Render the scene
    this.renderSky();
    this.renderTrack(track, car);
    this.renderCar(car);
    this.renderHUD(car);
    
    this.lastFrameTime = now;
  }
  
  private renderSky(): void {
    // Sky gradient (darker at top, lighter at horizon)
    const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.horizon);
    skyGradient.addColorStop(0, '#1E3C72');  // Dark blue
    skyGradient.addColorStop(1, '#2A5298');  // Lighter blue
    
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, this.width, this.horizon);
    
    // Draw sun (simple circle)
    this.ctx.beginPath();
    this.ctx.arc(this.width * 0.8, this.horizon * 0.5, 40, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fill();
    
    // Ground gradient (darker in distance, lighter near)
    const groundGradient = this.ctx.createLinearGradient(0, this.horizon, 0, this.height);
    groundGradient.addColorStop(0, '#2E8B57');  // Sea green (distant)
    groundGradient.addColorStop(1, '#3CB371');  // Medium sea green (near)
    
    this.ctx.fillStyle = groundGradient;
    this.ctx.fillRect(0, this.horizon, this.width, this.height - this.horizon);
    
    // Draw horizon line
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.horizon);
    this.ctx.lineTo(this.width, this.horizon);
    this.ctx.stroke();
  }
  
  private project(point: { x: number, y: number, z: number, width?: number }, cameraX: number, cameraY: number, cameraZ: number): { x: number, y: number, w: number, scale: number } {
    // Translate point relative to camera
    const x = point.x - cameraX;
    const y = point.y - cameraY;
    const z = point.z - cameraZ;
    
    // Apply perspective projection
    const scale = this.camera.fieldOfView / (this.camera.fieldOfView + z);
    const x2d = x * scale + this.width / 2;
    const y2d = y * scale + this.horizon;
    
    return { x: x2d, y: y2d, w: (point.width || 1) * scale, scale };
  }
  
  private renderTrack(track: Track, car: Car): void {
    const segments = track.getVisibleSegments(car);
    if (segments.length < 2) return;
    
    // Find the segment the car is currently on
    const baseSegment = segments[0];
    const cameraZ = car.z - this.camera.distance * track.getSegmentLength();
    
    // Draw segments from back to front (painter's algorithm)
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];
      const nextSegment = segments[i + 1] || segment;
      
      // Project points to screen space
      const p1 = this.project(
        { x: segment.x, y: segment.elevation, z: segment.z, width: segment.width },
        car.x, this.camera.height, cameraZ
      );
      
      const p2 = this.project(
        { x: nextSegment.x, y: nextSegment.elevation, z: nextSegment.z, width: nextSegment.width },
        car.x, this.camera.height, cameraZ
      );
      
      // Skip if segment is behind camera or too far away
      if (p1.scale <= 0 || p2.scale <= 0) continue;
      
      // Draw road segment
      this.drawSegment(
        p1.x, p1.y, p1.w,
        p2.x, p2.y, p2.w,
        segment.color1, // Road color
        segment.color2, // Grass color
        segment.color3, // Rumble color
        p1.scale,
        p2.scale
      );
    }
  }
  
  private drawSegment(
    x1: number, y1: number, w1: number,
    x2: number, y2: number, w2: number,
    color1: string, color2: string, color3: string,
    scale1: number, scale2: number
  ): void {
    const ctx = this.ctx;
    const width = this.width;
    
    // Calculate polygon points for the road segment
    const x1l = x1 - w1 / 2;
    const x1r = x1 + w1 / 2;
    const x2l = x2 - w2 / 2;
    const x2r = x2 + w2 / 2;
    
    // Draw grass on sides
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.moveTo(0, y1);
    ctx.lineTo(width, y1);
    ctx.lineTo(width, y2);
    ctx.lineTo(0, y2);
    ctx.closePath();
    ctx.fill();
    
    // Draw road
    ctx.fillStyle = color1;
    ctx.beginPath();
    ctx.moveTo(x1l, y1);
    ctx.lineTo(x1r, y1);
    ctx.lineTo(x2r, y2);
    ctx.lineTo(x2l, y2);
    ctx.closePath();
    ctx.fill();
    
    // Draw road edges
    ctx.strokeStyle = color3;
    ctx.lineWidth = 4;
    
    // Left edge
    ctx.beginPath();
    ctx.moveTo(x1l, y1);
    ctx.lineTo(x2l, y2);
    ctx.stroke();
    
    // Right edge
    ctx.beginPath();
    ctx.moveTo(x1r, y1);
    ctx.lineTo(x2r, y2);
    ctx.stroke();
    
    // Draw lane markings (if not start/finish line)
    if (color1 !== '#FFFFFF' && color1 !== '#000000') {
      const dashLength = 10 * scale1;
      const dashGap = 5 * scale1;
      
      // Only draw center line if road is wide enough
      if (w1 > 40) {
        ctx.strokeStyle = color3;
        ctx.lineWidth = 2;
        ctx.setLineDash([dashLength, dashGap]);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Reset line dash
        ctx.setLineDash([]);
      }
    }
  }
  
  private renderCar(car: Car): void {
    // Draw car (more detailed than a simple triangle)
    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height * 0.7);
    this.ctx.rotate(car.angle);
    
    // Car body
    this.ctx.fillStyle = '#FF4136'; // Red
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    
    // Car body
    this.ctx.beginPath();
    this.ctx.moveTo(0, -20);
    this.ctx.quadraticCurveTo(25, -15, 15, 20);
    this.ctx.lineTo(-15, 20);
    this.ctx.quadraticCurveTo(-25, -15, 0, -20);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    
    // Windshield
    this.ctx.fillStyle = '#3498db';
    this.ctx.beginPath();
    this.ctx.moveTo(-10, -10);
    this.ctx.quadraticCurveTo(0, -15, 10, -10);
    this.ctx.lineTo(8, 5);
    this.ctx.quadraticCurveTo(0, 0, -8, 5);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    
    // Wheels
    this.ctx.fillStyle = '#333';
    
    // Front wheels
    this.ctx.save();
    this.ctx.translate(-12, 0);
    this.ctx.beginPath();
    this.ctx.ellipse(0, 15, 5, 8, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
    
    this.ctx.save();
    this.ctx.translate(12, 0);
    this.ctx.beginPath();
    this.ctx.ellipse(0, 15, 5, 8, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
    
    // Rear wheels
    this.ctx.save();
    this.ctx.translate(-10, 0);
    this.ctx.beginPath();
    this.ctx.ellipse(0, -10, 4, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
    
    this.ctx.save();
    this.ctx.translate(10, 0);
    this.ctx.beginPath();
    this.ctx.ellipse(0, -10, 4, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
    
    this.ctx.restore();
  }
  
  private renderHUD(car: Car): void {
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;
    
    // Speed display
    const speed = Math.abs(Math.round(car.speed * 10));
    const speedText = `${speed} km/h`;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(20, 20, 120, 50);
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText('SPEED', 30, 40);
    
    ctx.font = 'bold 24px Arial';
    ctx.fillText(speedText, 30, 65);
    
    // FPS counter
    if (this.fps > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(width - 70, 10, 60, 25);
      
      ctx.fillStyle = '#0f0';
      ctx.font = '14px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`${this.fps} FPS`, width - 15, 30);
      ctx.textAlign = 'left';
    }
    
    // Lap counter (placeholder)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width - 120, height - 40, 100, 30);
    
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('LAP 1/3', width - 25, height - 20);
    ctx.textAlign = 'left';
  }
}
