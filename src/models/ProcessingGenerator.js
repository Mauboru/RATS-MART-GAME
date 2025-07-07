import { Item } from '.';

export default class ProcessingGenerator {
  constructor(x, y, width, height, sprite, inputType, outputType, inputNeeded, outputSprite) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = sprite;

    this.inputType = inputType;
    this.outputType = outputType;
    this.inputNeeded = inputNeeded;
    this.outputSprite = outputSprite;

    this.inputItems = []; 
    this.outputItems = [];

    this.processingTime = 200;
    this.currentProcessingTime = 0;

    this.isBroken = false;
    this.breakTimer = 0;
    this.maxBreakTime = 3000;

    this.inputOffsets = [
      { x: -25, y: 0 },
      { x: -5, y: 0 },
      { x: -25, y: 20 },
      { x: -5, y: 20 },
    ];
    this.outputOffsets = [
      { x: 25, y: 0 },
      { x: 45, y: 0 },
      { x: 25, y: 20 },
      { x: 45, y: 20 },
    ];

    this.collisionRegion = { 
      x: 0, 
      y: this.height - 30, 
      width: this.width, 
      height: 30 
    };
  }

  update() {
    if (this.isBroken) return;

    if (this.outputItems.length >= 4) return;

    if (this.inputItems.length > 0) {
      this.currentProcessingTime++;

      if (this.currentProcessingTime >= this.processingTime && this.inputItems.length > 0) {
        this.inputItems.shift();
        this.currentProcessingTime = 0;
        this.processedItemCount = (this.processedItemCount || 0) + 1;
      
        if (this.processedItemCount > 0) {
          const offset = this.outputOffsets[this.outputItems.length];
          const item = new Item(
            this.x + this.width / 2 + offset.x,
            this.y + this.height / 2 + offset.y,
            20, 27,
            this.outputSprite,
            this.outputType
          );
          item.slotIndex = this.outputItems.length;
      
          this.outputItems.push(item);
          this.processedItemCount = 0;
        }
      }
    } else {
      this.currentProcessingTime = 0;
    }

    this.breakTimer++;
    if (this.breakTimer >= this.maxBreakTime) {
      this.isBroken = true;
    }
  }

  tryInsertItem(item) {
    if (this.isBroken) return false;
    if (item.type === this.inputType && this.inputItems.length < 4) {
      this.inputItems.push(item);
      return true;
    }
    return false;
  }

  takeOutputItem() {
    return this.outputItems.shift();
  }

  repair() {
    this.isBroken = false;
    this.breakTimer = 0;
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

  draw(ctx, cameraX, cameraY) {
    ctx.drawImage(this.sprite, this.x - cameraX, this.y - cameraY, this.width, this.height);

    if (this.inputItems.length > 0 && !this.isBroken && this.outputItems.length < 4) {
      const progressRatio = this.currentProcessingTime / this.processingTime;
      ctx.fillStyle = 'lime';
      ctx.fillRect(
        this.x - cameraX,
        this.y - 10 - cameraY,
        this.width * progressRatio,
        5
      );
    }

    const col = this.collisionRegion;
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.x + col.x - cameraX,
      this.y + col.y - cameraY,
      col.width,
      col.height
    );

    if (this.isBroken) {
      ctx.fillStyle = 'red';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QUEBRADO', this.x + this.width / 2 - cameraX, this.y - 15 - cameraY);
    }

    // desenha itens de entrada
    this.inputItems.forEach((item, index) => {
      const offset = this.inputOffsets[index];
      item.x = this.x + this.width / 2 + offset.x - 50;
      item.y = this.y + this.height / 2 + offset.y - 30;
      item.draw(ctx, cameraX, cameraY);
    });

    // desenha itens de saída
    this.outputItems.forEach((item, index) => {
      const offset = this.outputOffsets[index];
      item.x = this.x + this.width / 2 + offset.x - 10;
      item.y = this.y + this.height / 2 + offset.y - 30;
      item.draw(ctx, cameraX, cameraY);
    });
  }
}
