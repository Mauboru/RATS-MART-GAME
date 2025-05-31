export default class ConstructionSpot {
  constructor(x, y, width, height, cost, image, type, isVisible = true) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.cost = cost;
    this.image = image;
    this.type = type;
    this.isBuilt = false;
    this.isVisible = isVisible;
    this.incomingMoneys = [];
  }

  checkCollision(player) {
    if (!this.isVisible) return false;

    return (
      player.x < this.x + this.width &&
      player.x + player.drawWidth > this.x &&
      player.y < this.y + this.height &&
      player.y + player.drawHeight > this.y
    );
  }

  addIncomingMoney(money) {
    this.incomingMoneys.push(money);
  }

  updateIncomingMoneys() {
    for (let i = this.incomingMoneys.length - 1; i >= 0; i--) {
      const m = this.incomingMoneys[i];
      const dx = this.x - m.x;
      const dy = this.y - m.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 1) {
        m.x += (dx / dist) * 2;
        m.y += (dy / dist) * 2;
      }

      if (
        m.x < this.x + this.width &&
        m.x + m.width > this.x &&
        m.y < this.y + this.height &&
        m.y + m.height > this.y
      ) {
        this.cost -= 1;
        this.incomingMoneys.splice(i, 1);
      }
    }
  }

  isReadyToBuild() {
    return this.cost <= 0 && !this.isBuilt;
  }

  draw(ctx, cameraX, cameraY) {
    if (!this.isBuilt && this.isVisible && this.image) {
      ctx.drawImage(this.image, this.x - cameraX, this.y - cameraY, this.width, this.height);
    }
  
    if (this.isVisible) {
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      const textX = this.x + this.width / 2 - cameraX;
      const textY = this.y + this.height + 18 - cameraY;
      ctx.fillText(`$${this.cost}`, textX, textY);
    }
  }
}
