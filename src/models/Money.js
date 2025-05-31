export default class Money {
  constructor(x, y, width, height, sprite) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = sprite;
  }

  draw(ctx, cameraX, cameraY) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;
    ctx.drawImage(this.sprite, drawX, drawY, this.width, this.height);
  }
}