export default class Client {
  constructor(x, y, speed, targetBox, paymentBox, requiredItems, spriteSheet, frameWidth, frameHeight) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.targetBox = targetBox;
    this.paymentBox = paymentBox;
    this.requiredItems = requiredItems;
    this.items = [];
    this.state = 'goingToBox'; 
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.drawWidth = frameWidth;
    this.drawHeight = frameHeight;
    this.width = this.drawWidth;
    this.height = this.drawHeight;
    this.isDone = false;
    this.exitX = 0;
    this.exitY = 0;

    this.currentFrame = 0;
    this.frameCount = 8;
    this.frameDelay = 6;
    this.frameTimer = 0;

    this.facing = 'right';

    this.collectDelay = 300; // tempo (ms) para pegar um item
    this.lastCollectTime = 0;
  }

  update(currentTime = performance.now()) {
    if (this.state === 'goingToBox') {
      this.moveTo(this.targetBox);
      if (this.checkCollision(this.targetBox)) {
        this.state = 'waiting';
      }
    } else if (this.state === 'waiting') {
      if (this.waitPos) {
        this.moveTo(this.waitPos);
      }
      // coleta lenta: pega 1 item a cada collectDelay ms
      if (
        this.targetBox.items.length > 0 &&
        this.items.length < this.requiredItems &&
        currentTime - this.lastCollectTime > this.collectDelay
      ) {
        const item = this.targetBox.items.pop();
        this.items.push(item);
        this.lastCollectTime = currentTime;
      }
      if (this.items.length >= this.requiredItems) {
        this.state = 'goingToPayment';
      }
    } else if (this.state === 'goingToPayment') {
      this.moveTo(this.paymentBox);
      if (this.checkCollision(this.paymentBox)) {
        const totalPayment = this.items.length * 10;
        this.paymentBox.addMoney(totalPayment);
        this.items = [];
        this.state = 'leaving';
        this.exitX = 0;
        this.exitY = 0;
      }
    } else if (this.state === 'leaving') {
      this.moveTo({ x: this.exitX, y: this.exitY });
      if (Math.hypot(this.x - this.exitX, this.y - this.exitY) < 5) {
        this.isDone = true;
      }
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

  moveTo(target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;

      if (dx > 0) {
        this.facing = 'right';
      } else if (dx < 0) {
        this.facing = 'left';
      }
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

  draw(ctx, cameraX, cameraY) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;

    const row = this.state === 'waiting' ? 0 : 1;

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
