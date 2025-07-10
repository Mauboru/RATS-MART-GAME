import Money from "./Money";

export default class PaymentBox {
  constructor(x, y, width, height, moneyImg, img, maxMoneys = 1000) {
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

  setMoney(money) {
    this.money = money;
  }

  rebuildMoneyStack() {
    this.generatedMoneys = [];
  
    const count = Math.min(this.money, this.maxMoneys); // ok
  
    for (let i = 0; i < count; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const offsetX = (col - 1) * 20;
      const offsetY = -row * 10;
  
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

  updateMovingMoneys(player) {
    const BASE_COOLDOWN = 65;
    const MIN_COOLDOWN = 12;
    const ACCELERATION_RATE = 0.1;
  
    const now = Date.now();
  
    // Verifica colisão apenas para gerar novas moedas
    if (this.checkCollision(player) && this.money > 0) {
      if (!this.collisionStartTime) this.collisionStartTime = now;
  
      const collisionDuration = (now - this.collisionStartTime) / 1000;
  
      const dynamicCooldown = Math.max(
        MIN_COOLDOWN,
        BASE_COOLDOWN - (ACCELERATION_RATE * collisionDuration)
      );
  
      if (!this.lastTransferTime || now - this.lastTransferTime >= dynamicCooldown) {
        const moneyToTransfer = Math.min(1, this.money);
        this.money -= moneyToTransfer;
  
        const index = this.generatedMoneys.length;
        const col = index % 3;
        const row = Math.floor(index / 3);
        const offsetX = (col - 1) * 20;
        const offsetY = -row * 10;
        
        const originX = this.x + this.width / 2 + offsetX - 16;
        const originY = this.y + offsetY;
        
        const newMoney = new Money(
          originX,
          originY,
          32,
          32,
          this.moneyImg
        );
        newMoney.origin = { x: originX, y: originY };
        newMoney.target = 'player';
  
        this.movingMoneys.push(newMoney);
  
        if (this.generatedMoneys.length > 0) this.generatedMoneys.pop();
  
        this.lastTransferTime = now;
      }
    } else {
      this.collisionStartTime = null;
      this.lastTransferTime = null;
    }
  
    // SEMPRE atualiza movimentação das moedas
    for (let i = this.movingMoneys.length - 1; i >= 0; i--) {
      const m = this.movingMoneys[i];
  
      // Verifica se ainda deve ir pro jogador ou voltar pra pilha
      if (this.checkCollision(player)) {
        m.target = 'player';
      } else {
        m.target = 'pile';
      }
  
      const target = m.target === 'player' ? player : m.origin;
  
      const dx = target.x - m.x;
      const dy = target.y - m.y;
      const dist = Math.hypot(dx, dy);
  
      const speed = Math.min(5, 2 + dist * 0.1);
  
      if (dist > 1) {
        m.x += (dx / dist) * speed;
        m.y += (dy / dist) * speed;
      }
  
      if (m.target === 'player' && player.checkCollision(m)) {
        player.money += 1;
        this.movingMoneys.splice(i, 1);
      } else if (m.target === 'pile' && dist < 2) {
        this.money += 1;
        this.generatedMoneys.push(m);
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

    // 🟥 Desenha a caixa de colisão (debug)
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
  
    ctx.drawImage(this.img, drawX, drawY, this.width, this.height);

    this.generatedMoneys.forEach(money => money.draw(ctx, cameraX, cameraY));
    this.movingMoneys.forEach(m => m.draw(ctx, cameraX, cameraY));
  }
}
