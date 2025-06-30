import { Item } from '.';

export default class GeneratorObject {
  constructor(x, y, width, height, sprite, itemSprite, itemCooldown = 300, maxItems = 3, type='apple') {
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
    this.type = type;

    this.offsets = [
      { x: 0, y: 0 },
      { x: -20, y: -5 },
      { x: 10, y: -15 },
    ];
  }

  getBaseY() {
    return this.y + this.height;
  }

  hasItem() {
    return this.generatedItems.length > 0;
  }

  takeItem() {
    return this.generatedItems.shift();
  }

  update() {
    this.timer++;
    const usedSlots = this.generatedItems.map(item => item.slotIndex);
    const availableSlots = this.offsets
      .map((offset, index) => index)
      .filter(index => !usedSlots.includes(index));

    if (availableSlots.length === 0) {
      this.timer = 0;
      return;
    }

    if (this.timer >= this.cooldown) {
      const slotIndex = availableSlots[0]; 
      const offset = this.offsets[slotIndex];

      const newItem = new Item(
        this.x + this.width / 2 + offset.x,
        this.y + this.height / 2 + offset.y,
        48, 32,
        this.itemSprite
      );
      newItem.slotIndex = slotIndex;

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
