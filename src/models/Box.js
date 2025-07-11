import { debugCollision } from "../utils/config";

export default class Box {
  constructor(x, y, width, height, sprite, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = sprite;
    this.type = type;
    this.items = [];
    this.capacity = 9;

    this.collisionRegion = { 
      x: 0, 
      y: this.height - 30, 
      width: this.width, 
      height: 30 
    };
  }

  isFull() {
    return this.items.length >= this.capacity;
  }

  addItem(item) {
    if (!this.isFull() && item.type === this.type) {
      this.items.push(item);
    }
  }

  checkCollision(entity) {
    return (
      entity.x < this.x + this.width &&
      entity.x + entity.drawWidth > this.x &&
      entity.y < this.y + this.height &&
      entity.y + entity.drawHeight > this.y
    );
  }

  getBaseY() {
    return this.y + this.height;
  }

  getTotalItems() {
    return this.items;
  }

  setItems(items) {
    this.items = items;
  }

  draw(ctx, cameraX, cameraY) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;

    ctx.drawImage(this.sprite, drawX, drawY, this.width, this.height);

    const itemSize = 16;
    const padding = 4;
    const cols = Math.floor(this.width / (itemSize + padding));

    // 🟥 Desenha a caixa de colisão (debug)
    if (debugCollision) {
      const col = this.collisionRegion;
      ctx.save();
      ctx.lineWidth = 1;
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; 
      ctx.fillRect(
        this.x + col.x - cameraX,
        this.y + col.y - cameraY,
        col.width,
        col.height
      );
    }
    
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (!item || !item.sprite) continue;  // Pula se item inválido
    
      const col = i % cols;
      const row = Math.floor(i / cols);
      const itemX = drawX + col * (itemSize + padding) + padding / 2;
      const itemY = drawY + row * (itemSize + padding) + padding / 2;
      ctx.drawImage(item.sprite, itemX, itemY, itemSize, itemSize);
    }
  }
}
