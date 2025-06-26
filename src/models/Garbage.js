export default class Garbage {
  constructor(x, y, width, height, sprite) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = sprite;

    this.chargeProgress = 0;
    this.chargeTime = 300;
    this.isCharging = false;
    this.lastChargeTime = 0;
  }

  getBaseY() {
    return this.y + this.height;
  }

  checkCollision(entity) {
    return (
      entity.x < (this.x - 32) + this.width &&
      entity.x + entity.drawWidth > (this.x + 32) &&
      entity.y < (this.y - 32) + this.height &&
      entity.y + entity.drawHeight > (this.y + 32)
    );
  }

  processPlayerInteraction(player, deltaTime) {
    if (this.checkCollision(player)) {
      if (!this.isCharging) {
        this.isCharging = true;
        this.lastChargeTime = performance.now();
      }
  
      this.chargeProgress += deltaTime;
  
      if (this.chargeProgress >= this.chargeTime) {
        this.removeItens(player);
        this.chargeProgress = this.chargeTime;
      }
    } else {
      this.resetCharge();
    }
  }
  
  resetCharge() {
    this.chargeProgress = 0;
    this.isCharging = false;
    this.lastChargeTime = 0;
  }  

  removeItens(entity) {
    entity.items = [];
  }

  draw(ctx, cameraX, cameraY) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;
  
    ctx.drawImage(this.sprite, drawX, drawY, this.width, this.height);
  
    if (this.isCharging && this.chargeProgress !== 300) {
      const barWidth = this.width;
      const barHeight = 6;
      const progressRatio = this.chargeProgress / this.chargeTime;
  
      ctx.fillStyle = "#444";
      ctx.fillRect(drawX, drawY - 10, barWidth, barHeight);
  
      ctx.fillStyle = "#0f0";
      ctx.fillRect(drawX, drawY - 10, barWidth * progressRatio, barHeight);
  
      ctx.strokeStyle = "#000";
      ctx.strokeRect(drawX, drawY - 10, barWidth, barHeight);
    }
  }
}