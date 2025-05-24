import { Item } from '../models/Item';

export class GeneratorObject {
  constructor(x, y, width, height, sprite, itemSprite, itemCooldown = 300, maxItems = 3) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = sprite;

    this.itemSprite = itemSprite;
    this.generatedItems = []; 
    this.cooldown = itemCooldown;
    this.timer = 0;
    this.maxItems = maxItems;
  }

  update() {
    this.timer++;
    if (this.generatedItems.length < this.maxItems && this.timer >= this.cooldown) {
      const offsets = [
        { x: 0, y: 0 },
        { x: -20, y: -5 },
        { x: 10, y: -15 },
      ];
  
      const index = this.generatedItems.length; 
      const offset = offsets[index] || { x: 0, y: 0 };
  
      const newItem = new Item(
        this.x + this.width / 2 + offset.x,
        this.y + this.height / 2 + offset.y,
        16,
        16,
        this.itemSprite
      );
      this.generatedItems.push(newItem);
      this.timer = 0;
    }
  }
  
  draw(ctx, cameraX, cameraY) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;

    ctx.drawImage(this.sprite, drawX, drawY, this.width, this.height);

    this.generatedItems.forEach(item => item.draw(ctx, cameraX, cameraY));
  }
}
