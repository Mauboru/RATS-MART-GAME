import Entidade from './Entidade';

export default class Client extends Entidade {
  constructor(x, y, speed, targetBox, paymentBox, requiredItems, spriteSheet, frameWidth, frameHeight, gameManager) {
    super(x, y, speed, spriteSheet, frameWidth, frameHeight);

    this.targetBox = targetBox;
    this.paymentBox = paymentBox;
    this.requiredItems = requiredItems;

    this.currentItemIndex = 0;
    this.collectedItems = {};

    this.state = 'goingToBox';
    this.queue = '';
    this.isDone = false;
    this.exitX = 0;
    this.exitY = 0;

    this.transferCooldown = 12;
    this.transferTimer = 0;
    this.moneyToTransfer = 0;

    this.collectDelay = 300;
    this.lastCollectTime = 0;

    this.currentCollector = null;
  }

  #roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
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
    const currentItemReq = this.requiredItems[this.currentItemIndex];

    if (this.state === 'goingToBox') {
      this.queue = currentItemReq.type;
      this.moveTo(this.targetBox);
      if (this.checkCollision(this.targetBox)) {
        this.state = 'waiting';
      }
    } else if (this.state === 'waiting') {
        if (this.waitPos) {
          const dx = this.waitPos.x - this.x;
          const dy = this.waitPos.y - this.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 20) {
            this.moveTo(this.waitPos);
          } else {
            this.vx = 0;
            this.vy = 0;
          }
        }
        if (!this.targetBox.currentCollector || this.targetBox.currentCollector === this) {
          this.targetBox.currentCollector = this;

          if (
            this.targetBox.items.length > 0 &&
            (this.collectedItems[currentItemReq.type] || 0) < currentItemReq.amount &&
            currentTime - this.lastCollectTime > this.collectDelay
          ) {
            const item = this.targetBox.items.find(i => i.type === currentItemReq.type);
            if (item) {
              this.targetBox.items.splice(this.targetBox.items.indexOf(item), 1);
              this.items.push(item);
              this.collectedItems[currentItemReq.type] = (this.collectedItems[currentItemReq.type] || 0) + 1;
              this.lastCollectTime = currentTime;
            }
          }

          if ((this.collectedItems[currentItemReq.type] || 0) >= currentItemReq.amount) {
            this.targetBox.currentCollector = null;
            this.currentItemIndex++;

            if (this.currentItemIndex < this.requiredItems.length) {
              const nextItem = this.requiredItems[this.currentItemIndex];
              const nextBox = this.gameManager.boxes.find(b => b.type === nextItem.type);
              if (nextBox) this.targetBox = nextBox;
              this.state = 'goingToBox';
            } else {
              this.state = 'goingToPayment';
            }
          }
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

    const boxWidth = this.requiredItems.length * 38 + 1;
    const boxHeight = 40;
    const boxX = this.x - cameraX + this.drawWidth / 2 - boxWidth / 2;
    const boxY = this.y - cameraY + this.drawHeight + 8;

    // Caixa de fundo arredondada
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    this.#roundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Desenhar cada ícone + texto
    this.requiredItems.forEach((item, index) => {
      const icon = this.gameManager.assets.icons[item.type]; 
      const x = boxX + 8 + index * 26;
      const y = boxY + 4;

      if (icon) ctx.drawImage(icon, x, y, 20, 20);

      // Quantidade
      ctx.font = '12px Arial';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;

      const text = `x${item.amount}`;
      ctx.strokeText(text, x + 16, y + 16 +10);
      ctx.fillText(text, x + 16, y + 16 +10);
    });
  }
}