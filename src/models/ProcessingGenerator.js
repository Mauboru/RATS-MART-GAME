import { Item } from '.';

export default class ProcessingGenerator {
  constructor(x, y, width, height, sprite, inputType, outputType, inputNeeded, outputSprite) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = sprite;

    this.inputType = inputType;       // ex: 'maca'
    this.outputType = outputType;     // ex: 'suco'
    this.inputNeeded = inputNeeded;   // ex: 3 maçãs para gerar 1 suco
    this.outputSprite = outputSprite;

    this.storedItems = 0;
    this.outputItems = [];
    this.offsets = [{ x: 0, y: 0 }, { x: -15, y: -10 }, { x: 10, y: -15 }];
  }

  update() {
    // Verifica se tem itens suficientes para gerar
    if (this.storedItems >= this.inputNeeded) {
      const slotIndex = this.outputItems.length;
      if (slotIndex >= this.offsets.length) return;

      const offset = this.offsets[slotIndex];

      const item = new Item(
        this.x + this.width / 2 + offset.x,
        this.y + this.height / 2 + offset.y,
        48, 32,
        this.outputSprite,
        this.outputType
      );

      item.slotIndex = slotIndex;
      this.outputItems.push(item);
      this.storedItems -= this.inputNeeded;
    }
  }

  tryInsertItem(item) {
    if (item.type === this.inputType && this.outputItems.length < this.offsets.length) {
      this.storedItems++;
      return true; // item consumido
    }
    return false; // rejeitado
  }

  getBaseY() {
    return this.y + this.height;
  }

  takeOutputItem() {
    return this.outputItems.shift();
  }

  checkCollision(entity) {
    return (
      this.x < entity.x + entity.width &&
      this.x + this.width > entity.x &&
      this.y < entity.y + entity.height &&
      this.y + this.height > entity.y
    );
  }

  draw(ctx, cameraX, cameraY) {
    ctx.drawImage(this.sprite, this.x - cameraX, this.y - cameraY, this.width, this.height);

    // Texto com progresso
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${this.storedItems}/${this.inputNeeded} ${this.inputType}`,
      this.x + this.width / 2 - cameraX,
      this.y + this.height + 16 - cameraY
    );

    this.outputItems.forEach(item => item.draw(ctx, cameraX, cameraY));
  }
}
