import Entidade from './Entidade';

export default class Client extends Entidade {
  constructor(x, y, speed, targetBox, paymentBox, requiredItems, spriteSheet, frameWidth, frameHeight) {
    super(x, y, speed, spriteSheet, frameWidth, frameHeight);

    this.targetBox = targetBox;
    this.paymentBox = paymentBox;
    this.requiredItems = requiredItems;

    this.state = 'goingToBox';
    this.isDone = false;
    this.exitX = 0;
    this.exitY = 0;

    this.transferCooldown = 12;
    this.transferTimer = 0;
    this.moneyToTransfer = 0;

    this.collectDelay = 300;
    this.lastCollectTime = 0;
  }

  checkCollisionWith(entidade) {
    if (!entidade) return false;
    return (
      entidade.x < this.x + this.width &&
      entidade.x + entidade.width > this.x &&
      entidade.y < this.y + this.height &&
      entidade.y + entidade.height > this.y
    );
  }

  update(player, cashier, currentTime = performance.now()) {
    if (this.state === 'goingToBox') {
      this.moveTo(this.targetBox);
      if (this.checkCollision(this.targetBox)) {
        this.state = 'waiting';
      }
    } else if (this.state === 'waiting') {
      if (this.waitPos) this.moveTo(this.waitPos);

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
        this.state = 'waitingForPlayer';
      }
    } else if (this.state === 'leaving') {
      this.moveTo({ x: this.exitX, y: this.exitY });
      if (Math.hypot(this.x - this.exitX, this.y - this.exitY) < 5) {
        this.isDone = true;
      }
    } else if (this.state === 'waitingForPlayer') {
      if (this.paymentBox.checkPlayerCollision(player) || this.paymentBox.checkPlayerCollision(cashier)) {
        if (this.moneyToTransfer === 0) {
          this.moneyToTransfer = this.items.length * 10;
          this.items = [];
        }
        if (this.moneyToTransfer > 0) {
          this.paymentBox.addMoney(this.moneyToTransfer);
          this.moneyToTransfer = 0;
          this.state = 'leaving';
          this.exitX = 0;
          this.exitY = 0;
        }
      }
    }

    this.updateAnimation();
  }

  draw(ctx, cameraX, cameraY) {
    const row = this.state === 'waiting' ? 0 : 1;
    super.draw(ctx, cameraX, cameraY, row);
  
    // Desenha a quantidade e tipo do item que o cliente quer
    const text = `${this.requiredItems}x ${this.targetBox.type}`;
    ctx.font = '14px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
  
    const textX = this.x - cameraX + this.drawWidth / 2;
    const textY = this.y - cameraY + this.drawHeight + 10;
  
    ctx.strokeText(text, textX, textY);
    ctx.fillText(text, textX, textY);
  }
  
}
