// Input handler for keyboard controls
export class InputHandler {
  public left: boolean = false;
  public right: boolean = false;
  public up: boolean = false;
  public down: boolean = false;
  
  constructor() {
    // Add event listeners for keyboard input
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Add touch controls for mobile
    this.setupTouchControls();
  }
  
  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowLeft':
        this.left = true;
        break;
      case 'ArrowRight':
        this.right = true;
        break;
      case 'ArrowUp':
        this.up = true;
        break;
      case 'ArrowDown':
        this.down = true;
        break;
    }
  }
  
  private handleKeyUp(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowLeft':
        this.left = false;
        break;
      case 'ArrowRight':
        this.right = false;
        break;
      case 'ArrowUp':
        this.up = false;
        break;
      case 'ArrowDown':
        this.down = false;
        break;
    }
  }
  
  private setupTouchControls(): void {
    // Add touch controls for mobile devices
    const leftBtn = document.createElement('button');
    leftBtn.textContent = '◀';
    leftBtn.style.position = 'fixed';
    leftBtn.style.left = '20px';
    leftBtn.style.bottom = '20px';
    leftBtn.style.fontSize = '24px';
    leftBtn.style.padding = '15px 25px';
    leftBtn.style.borderRadius = '50%';
    leftBtn.style.border = 'none';
    leftBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    leftBtn.style.touchAction = 'manipulation';
    
    const rightBtn = leftBtn.cloneNode() as HTMLButtonElement;
    rightBtn.textContent = '▶';
    rightBtn.style.left = '100px';
    
    const upBtn = leftBtn.cloneNode() as HTMLButtonElement;
    upBtn.textContent = '▲';
    upBtn.style.left = '60px';
    upBtn.style.bottom = '60px';
    
    const downBtn = leftBtn.cloneNode() as HTMLButtonElement;
    downBtn.textContent = '▼';
    downBtn.style.left = '60px';
    downBtn.style.bottom = '20px';
    
    // Add event listeners for touch controls
    leftBtn.addEventListener('touchstart', () => this.left = true);
    leftBtn.addEventListener('touchend', () => this.left = false);
    leftBtn.addEventListener('touchcancel', () => this.left = false);
    
    rightBtn.addEventListener('touchstart', () => this.right = true);
    rightBtn.addEventListener('touchend', () => this.right = false);
    rightBtn.addEventListener('touchcancel', () => this.right = false);
    
    upBtn.addEventListener('touchstart', () => this.up = true);
    upBtn.addEventListener('touchend', () => this.up = false);
    upBtn.addEventListener('touchcancel', () => this.up = false);
    
    downBtn.addEventListener('touchstart', () => this.down = true);
    downBtn.addEventListener('touchend', () => this.down = false);
    downBtn.addEventListener('touchcancel', () => this.down = false);
    
    // Add buttons to the document
    document.body.appendChild(leftBtn);
    document.body.appendChild(rightBtn);
    document.body.appendChild(upBtn);
    document.body.appendChild(downBtn);
  }
}
