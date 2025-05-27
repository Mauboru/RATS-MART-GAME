export class ConstructionSpot {
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
  