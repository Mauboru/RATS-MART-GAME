export default class Garbage {
  constructor(x, y, width, height, sprite) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = sprite;
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

  removeItens(entity) {
    entity.items = [];
  }

  draw(ctx, cameraX, cameraY) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;

    ctx.drawImage(this.sprite, drawX, drawY, this.width, this.height);
  }
}