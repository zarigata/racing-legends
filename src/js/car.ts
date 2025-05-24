// Constants for car physics
const CAR = {
  MAX_SPEED: 10,
  ACCELERATION: 0.2,
  DECELERATION: 0.95,
  TURN_SPEED: 0.03,
  DRIFT_FACTOR: 0.95,
  MAX_REVERSE_SPEED: -5,
  WIDTH: 20, // Width of the car in pixels
};

export class Car {
  public x: number;
  public y: number;
  public z: number; // Added for 3D positioning
  public angle: number;
  public speed: number;
  public maxSpeed: number;
  public acceleration: number;
  public turningSpeed: number;
  public width: number;
  
  constructor(x: number, y: number, angle: number) {
    this.x = x;
    this.y = y;
    this.z = 0; // Initialize z position
    this.angle = angle;
    this.speed = 0;
    this.maxSpeed = CAR.MAX_SPEED;
    this.acceleration = CAR.ACCELERATION;
    this.turningSpeed = CAR.TURN_SPEED;
    this.width = CAR.WIDTH;
  }
  
  public update(input: any, deltaTime: number): void {
    // Handle acceleration/deceleration
    if (input.up) {
      this.speed += this.acceleration;
    } else if (input.down) {
      this.speed -= this.acceleration;
    } else {
      // Apply friction when no input
      this.speed *= CAR.DECELERATION;
    }
    
    // Clamp speed
    this.speed = Math.max(CAR.MAX_REVERSE_SPEED, Math.min(this.maxSpeed, this.speed));
    
    // Handle turning
    if (Math.abs(this.speed) > 0.1) { // Only turn if moving
      const turnDirection = this.speed > 0 ? 1 : -1; // Reverse turning when going backwards
      
      if (input.left) {
        this.angle -= this.turningSpeed * turnDirection;
      }
      if (input.right) {
        this.angle += this.turningSpeed * turnDirection;
      }
    }
    
    // Apply movement
    this.x += Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
    
    // Keep angle between 0 and 2*PI
    if (this.angle < 0) this.angle += Math.PI * 2;
    if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2;
  }
  
  // Reset car to starting position
  public reset(x: number, y: number, angle: number): void {
    this.x = x;
    this.y = y;
    this.z = 0; // Reset z position
    this.angle = angle;
    this.speed = 0;
  }
}
