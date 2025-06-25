import Entidade from './Entidade';

export default class Cashier extends Entidade {
  constructor(x, y, speed, spriteSheet, frameWidth, frameHeight) {
    super(x, y, speed, spriteSheet, frameWidth, frameHeight);

    this.frameCount = 4;
    this.frameDelay = 8;

    this.direction = { x: 0, y: 0 };
    this.state = 'idle';

    this.width = frameWidth;
    this.height = frameHeight;
  }

  update(target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y + 40;
    const distance = Math.hypot(dx, dy);

    if (distance > 1) {
      this.direction = { x: dx / distance, y: dy / distance };
      this.state = 'walking';
    } else {
      this.direction = { x: 0, y: 0 };
      this.state = 'idle';
    }

    this.x += this.direction.x * this.speed;
    this.y += this.direction.y * this.speed;

    this.updateAnimation();
  }

  getBaseY() {
    return this.y + this.height;
  }

  draw(ctx, cameraX, cameraY) {
    const row = 0;
    super.draw(ctx, cameraX, cameraY, row);
  }
}
