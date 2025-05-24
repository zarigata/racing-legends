import { Car } from './car';

export interface TrackSegment {
  x: number;          // x position in world space
  y: number;          // y position in world space
  z: number;          // z position (depth) in world space
  width: number;      // width of the track at this segment
  curve: number;      // curvature of the track at this segment
  elevation: number;  // height/elevation of the track
  fogDensity: number; // density of fog for depth effect
  color1: string;     // primary color (road)
  color2: string;     // secondary color (shoulder/grass)
  color3: string;     // rumble color
  clip?: number;      // For rendering
}

// Track generation parameters
interface TrackParams {
  length: number;           // Total length of the track
  segmentLength: number;    // Length of each segment
  worldWidth: number;       // Width of the world
  trackWidth: number;       // Width of the track
  lanes: number;            // Number of lanes
  outsideRumble: number;    // Width of outside rumble strip
  insideRumble: number;     // Width of inside rumble strip
  curb: number;             // Width of curb
  dash: number;             // Width of dashed line
  hills?: number;           // Number of hills (optional)
  curves?: number;          // Number of curves (optional)
  difficulty?: number;      // Difficulty level (optional)
}

export class Track {
  public segments: TrackSegment[] = [];
  private params: TrackParams;
  private segmentLength: number = 100; // Default segment length
  private colors = {
    road: '#6B6B6B',
    grass: '#10AA10',
    rumble: '#555555',
    lane: '#CCCCCC',
    start: '#FFFFFF',
    finish: '#000000'
  };

  constructor(length: number = 2000) {
    // Initialize params first with default values
    this.params = {
      length: Math.max(1000, length),
      segmentLength: this.segmentLength, // Will be 100 from class field
      worldWidth: 2000,
      trackWidth: 2000,
      lanes: 3,
      outsideRumble: 5,
      insideRumble: 5,
      curb: 3,
      dash: 2
    };
    
    // Generate the track
    this.generateTrack();
  }

  private generateTrack(): void {
    // Generate a random seed for consistent generation
    const seed = Math.floor(Math.random() * 1000000);
    const rng = this.seededRandom(seed);
    
    // Track properties
    let trackX = 0;
    let trackY = 0;
    let trackZ = 0;
    let curve = 0;
    let elevation = 0;
    
    // Set default values for optional parameters
    const difficulty = this.params.difficulty ?? 0.5;
    const hills = this.params.hills ?? 20;
    const curves = this.params.curves ?? 20;
    
    // Generate track segments
    for (let n = 0; n < this.params.length; n++) {
      // Add some curves and elevation changes
      if (n % Math.floor(this.params.length / curves) === 0) {
        curve = (rng() * 2 - 1) * difficulty * 10;
      }
      
      if (n % Math.floor(this.params.length / hills) === 0) {
        elevation = (rng() * 2 - 1) * difficulty * 100;
      }
      
      // Update track position
      const angle = curve * (Math.PI / 180);
      trackX += Math.sin(angle) * this.segmentLength;
      trackZ += Math.cos(angle) * this.segmentLength;
      
      // Add segment
      this.segments.push({
        x: trackX,
        y: trackY + elevation,
        z: n * this.segmentLength,
        width: this.params.trackWidth,
        curve: curve,
        elevation: elevation,
        fogDensity: 0.5 + (rng() * 0.5),
        color1: this.colors.road,
        color2: this.colors.grass,
        color3: this.colors.rumble
      });
    }
    
    // Add start and finish lines
    if (this.segments.length > 0) {
      this.segments[0].color1 = this.colors.start;
      this.segments[this.segments.length - 1].color1 = this.colors.finish;
    }
  }

  // Seeded random number generator
  private seededRandom(seed: number): () => number {
    const x = Math.sin(seed++) * 10000;
    return () => {
      const x2 = Math.sin(seed++) * 10000;
      return x2 - Math.floor(x2);
    };
  }
  
  public getStartPosition(): { x: number; y: number; angle: number } {
    // Return a position slightly above the first segment to avoid clipping
    return {
      x: this.segments[10].x,
      y: this.segments[10].y,
      angle: 0
    };
  }
  
  // Get the length of each segment
  public getSegmentLength(): number {
    return this.segmentLength;
  }
  
  // Get the total number of segments
  public getSegmentCount(): number {
    return this.segments.length;
  }
  
  // Get visible segments from the car's perspective
  public getVisibleSegments(car: Car): TrackSegment[] {
    if (this.segments.length === 0) {
      return [];
    }
    
    const visibleSegments: TrackSegment[] = [];
    const segmentIndex = Math.floor(car.z / this.segmentLength) % this.segments.length;
    const maxVisible = 100; // Number of segments to render
    
    for (let i = 0; i < maxVisible; i++) {
      const idx = (segmentIndex + i) % this.segments.length;
      const segment = this.segments[idx];
      visibleSegments.push({
        ...segment,
        z: segment.z - car.z,
        // Adjust elevation based on car's position
        elevation: segment.elevation - car.y
      });
    }
    
    return visibleSegments;
  }
  
  // Check for collisions between car and track
  public checkCollisions(car: Car): boolean {
    if (this.segments.length === 0) {
      return false;
    }
    
    const segmentIndex = Math.floor(car.z / this.segmentLength) % this.segments.length;
    const segment = this.segments[segmentIndex];
    const nextSegment = this.segments[(segmentIndex + 1) % this.segments.length];
    
    if (!segment || !nextSegment) {
      return false;
    }
    
    // Calculate the position along the current segment (0 to 1)
    const p = (car.z % this.segmentLength) / this.segmentLength;
    
    // Interpolate track position and width
    const trackX = segment.x + (nextSegment.x - segment.x) * p;
    const trackY = segment.y + (nextSegment.y - segment.y) * p;
    const trackWidth = segment.width + (nextSegment.width - segment.width) * p;
    
    // Calculate distance from car to track center
    const dx = car.x - trackX;
    const dy = car.y - trackY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Define track boundaries
    const halfTrackWidth = trackWidth / 2;
    const halfCarWidth = car.width / 2;
    const collisionDistance = halfTrackWidth - halfCarWidth;
    
    // Check for collisions with track boundaries
    if (distance > collisionDistance) {
      // Car is colliding with track boundary
      car.speed *= 0.95; // Slow down on collision
      return true;
    }
    
    // No collision detected
    return false;
  }
}
