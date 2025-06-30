export default class Entidade {
    constructor(x, y, speed, spriteSheet, frameWidth, frameHeight) {
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.spriteSheet = spriteSheet;
      this.frameWidth = frameWidth;
      this.frameHeight = frameHeight;
      this.drawWidth = frameWidth;
      this.drawHeight = frameHeight;
      this.width = this.drawWidth;
      this.height = this.drawHeight;
  
      this.currentFrame = 0;
      this.frameCount = 8;
      this.frameDelay = 6;
      this.frameTimer = 0;
  
      this.facing = 'right';
      this.items = [];
    }
  
    getBaseY() {
      return this.y + this.drawHeight;
    }
  
    updateAnimation() {
      this.frameTimer++;
      if (this.frameTimer >= this.frameDelay) {
        this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        this.frameTimer = 0;
      }
    }
  
    moveTo(target) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
  
        this.facing = dx > 0 ? 'right' : dx < 0 ? 'left' : this.facing;
      }
    }
  
    checkCollision(target) {
      return (
        this.x < target.x + target.width &&
        this.x + this.width > target.x &&
        this.y < target.y + target.height &&
        this.y + this.height > target.y
      );
    }
  
    draw(ctx, cameraX, cameraY, stateRow = 0) {
      const drawX = this.x - cameraX;
      const drawY = this.y - cameraY;
  
      ctx.save();
      ctx.translate(drawX + this.drawWidth / 2, drawY + this.drawHeight / 2);
  
      if (this.facing === 'left') {
        ctx.scale(-1, 1);
      }
  
      ctx.drawImage(
        this.spriteSheet,
        this.currentFrame * this.frameWidth,
        stateRow * this.frameHeight,
        this.frameWidth,
        this.frameHeight,
        -this.drawWidth / 2,
        -this.drawHeight / 2,
        this.drawWidth,
        this.drawHeight
      );
  
      ctx.restore();
  
      const itemSize = 32;
      let offsetX = 0;
      
      if (this.state === 'idle') {
        offsetX = this.facing === 'right' ? -8 : -12;
      } else if (this.state === 'walking') {
        offsetX = this.facing === 'right' ? 0 : -20;
      }
      
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        if (item && item.sprite instanceof HTMLImageElement) {
          const itemX = drawX + this.drawWidth / 2 - itemSize / 2 + offsetX;
          const itemY = drawY - (i + 1) * (itemSize - 20);
          ctx.drawImage(item.sprite, itemX, itemY, 48, 32);
        }
      }
    }
  }
  