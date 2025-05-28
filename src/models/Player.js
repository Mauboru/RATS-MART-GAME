export default class Player {
  constructor(x, y, speed, spriteSheet, frameWidth, frameHeight) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.direction = { x: 0, y: 0 };
    this.state = 'idle';
    this.facing = 'right';
    this.money = 200;

    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.drawWidth = frameWidth; 
    this.drawHeight = frameHeight
    this.width = this.drawWidth;
    this.height = this.drawHeight;
    this.currentFrame = 0;
    this.frameCount = 8; 
    this.frameDelay = 6;
    this.frameTimer = 0;

    this.items = [];
    this.maxItems = 6;
  }

  update(direction) {
    this.direction = direction;

    if (direction.x !== 0 || direction.y !== 0) {
      this.state = 'walking';
      this.x += direction.x * this.speed;
      this.y += direction.y * this.speed;

      if (direction.x > 0) this.facing = 'right';
      else if (direction.x < 0) this.facing = 'left';
    } else {
      this.state = 'idle';
    }

    this.updateAnimation();
  }

  updateAnimation() {
    this.frameTimer++;
    if (this.frameTimer >= this.frameDelay) {
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      this.frameTimer = 0;
    }
  }
  
  addItem(item) {
    if (this.items.length < this.maxItems) {
      this.items.push(item);
    }
  }  

  draw(ctx, cameraX, cameraY) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;
  
    const row = this.state === 'idle' ? 0 : 1;
  
    ctx.save();
    ctx.translate(drawX + this.drawWidth / 2, drawY + this.drawHeight / 2);

    if (this.facing === 'left') {
      ctx.scale(-1, 1);
    }
  
    ctx.drawImage(
      this.spriteSheet,
      this.currentFrame * this.frameWidth,
      row * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      -this.drawWidth / 2,
      -this.drawHeight / 2, 
      this.drawWidth,
      this.drawHeight
    );
  
    ctx.restore();

    const itemSize = 16;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item && item.sprite instanceof HTMLImageElement) {
        const itemX = drawX + this.drawWidth / 2 - itemSize / 2;
        const itemY = drawY - (i + 1) * (itemSize + 2);
        ctx.drawImage(item.sprite, itemX, itemY, itemSize, itemSize);
      }
    }
  }
}