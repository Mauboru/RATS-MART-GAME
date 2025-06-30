import Entidade from './Entidade';
import { willCollide } from "../utils/collision";

export default class Player extends Entidade {
  constructor(x, y, speed, spriteSheet, frameWidth, frameHeight) {
    super(x, y, speed, spriteSheet, frameWidth, frameHeight);
    
    this.direction = { x: 0, y: 0 };
    this.state = 'idle';
    this.money = 100;
    this.items = [];
    this.maxItems = 3;

    this.frameCount = 3;
    this.frameDelay = 8;

    this.collisionRegion = { 
      x: 15, 
      y: this.height + 20, 
      width: this.width, 
      height: 10 
    };
  }

  update(direction, collidables) {
    this.direction = direction;
    const newX = this.x + direction.x * this.speed;
    const newY = this.y + direction.y * this.speed;

    const canMoveX = !collidables.some(obj =>
      willCollide({ x: newX, y: this.y, collisionRegion: this.collisionRegion }, obj, 0, 0)
    );

    if (canMoveX) this.x = newX;

    const canMoveY = !collidables.some(obj =>
      willCollide({ x: this.x, y: newY, collisionRegion: this.collisionRegion }, obj, 0, 0)
    );

    if (canMoveY) this.y = newY;

    if (direction.x !== 0 || direction.y !== 0) {
      this.state = 'walking';
      this.facing = direction.x > 0 ? 'right' : direction.x < 0 ? 'left' : this.facing;
    } else {
      this.state = 'idle';
    }

    this.updateAnimation();
  }

  addItem(item) {
    if (this.items.length < this.maxItems) {
      this.items.push(item);
    }
  }

  getItem() {
    return this.items.length;
  }

  draw(ctx, cameraX, cameraY) {
    let row = 1;
  
    if (this.items.length > 0) {
      if (this.state === 'idle') row = 3;
      else row = 2;
    } else {
      if (this.state === 'idle') row = 1;
      else row = 0;
    }
  
    super.draw(ctx, cameraX, cameraY, row, this.items);
  }
}
