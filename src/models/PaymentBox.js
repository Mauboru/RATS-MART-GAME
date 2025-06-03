import Money from "./Money";

export default class PaymentBox {
  constructor(x, y, width, height, moneyImg, img, maxMoneys = 50) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.img = img;
    this.money = 0;
    this.generatedMoneys = []; 
    this.maxMoneys = maxMoneys;
    this.moneyImg = moneyImg;
    this.movingMoneys = [];

    this.transferCooldown = 12; 
    this.transferTimer = 0;

    this.collisionRegion = { 
      x: 0, 
      y: this.height - 30, 
      width: this.width, 
      height: 30 
    };
  }

  updateMovingMoneys(player) {
    for (let i = this.movingMoneys.length - 1; i >= 0; i--) {
      const m = this.movingMoneys[i];
      
      const dx = player.x - m.x;
      const dy = player.y - m.y;
      const dist = Math.hypot(dx, dy);
  
      if (dist > 1) {
        m.x += (dx / dist) * 2;
        m.y += (dy / dist) * 2;
      }
  
      if (
        m.x < player.x + player.width &&
        m.x + m.width > player.x &&
        m.y < player.y + player.height &&
        m.y + m.height > player.y
      ) {
        player.money += 1;  
        this.movingMoneys.splice(i, 1); 
      }
    }
  }

  addMoney(amount) {
    this.money += amount;
  
    for (let i = 0; i < amount; i++) {
      if (this.generatedMoneys.length < this.maxMoneys) {
        const index = this.generatedMoneys.length;
  
        const col = index % 3;            // 0,1,2 → coluna
        const row = Math.floor(index / 3); // linha: 0,1,2,...
  
        const offsetX = (col - 1) * 20;   // col -1: centraliza (ex: -20, 0, +20)
        const offsetY = -row * 10;        // cada linha sobe 10px
  
        const newMoney = new Money(
          this.x + this.width / 2 + offsetX - 16, 
          this.y + offsetY,
          32,
          32,
          this.moneyImg
        );
  
        this.generatedMoneys.push(newMoney);
      }
    }
  }

  getBaseY() {
    return this.y + this.height;
  }
  
  checkCollision(player) {
    return (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    );
  }

  checkPlayerCollision(player) {
    if (!player) return false;
    
    return (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    );
  }

  draw(ctx, cameraX, cameraY) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;
  
    ctx.drawImage(this.img, drawX, drawY, this.width, this.height);

    this.generatedMoneys.forEach(money => money.draw(ctx, cameraX, cameraY));
    this.movingMoneys.forEach(m => m.draw(ctx, cameraX, cameraY));
  }
}
