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

  setMoney(money) {
    this.money = money;
  }

  rebuildMoneyStack() {
    this.generatedMoneys = [];
  
    const count = Math.min(this.money, this.maxMoneys);
  
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
    const BASE_COOLDOWN = 65; // Tempo inicial entre transferências
    const MIN_COOLDOWN = 12;   // Tempo mínimo (máxima aceleração)
    const ACCELERATION_RATE = 0.1; // Taxa de aceleração
  
    // Verifica colisão com o jogador
    if (this.checkCollision(player) && this.money > 0) {
      const now = Date.now();
  
      // Inicia o temporizador de aceleração
      if (!this.collisionStartTime) {
        this.collisionStartTime = now;
      }
      
      // Calcula duração da colisão em segundos
      const collisionDuration = (now - this.collisionStartTime) / 1000;
      
      // Calcula cooldown dinâmico (diminui com o tempo)
      const dynamicCooldown = Math.max(
        MIN_COOLDOWN,
        BASE_COOLDOWN - (ACCELERATION_RATE * collisionDuration)
      );
  
      // Verifica se pode transferir
      if (!this.lastTransferTime || now - this.lastTransferTime >= dynamicCooldown) {
        const moneyToTransfer = Math.min(1, this.money);
        this.money -= moneyToTransfer;
        
        // Cria moeda em movimento
        const newMoney = new Money(
          this.x + this.width / 2 - 16,
          this.y,
          32,
          32,
          this.moneyImg
        );
        this.movingMoneys.push(newMoney);
        
        // Atualiza pilha visual
        if (this.generatedMoneys.length > 0) {
          this.generatedMoneys.pop();
        }
        
        this.lastTransferTime = now;
      }
    } else {
      // Reseta temporizadores quando não há colisão
      this.collisionStartTime = null;
      this.lastTransferTime = null;
    }
  
    // Movimenta as moedas em direção ao jogador
    for (let i = this.movingMoneys.length - 1; i >= 0; i--) {
      const m = this.movingMoneys[i];
      
      const dx = player.x - m.x;
      const dy = player.y - m.y;
      const dist = Math.hypot(dx, dy);
  
      // Ajusta velocidade baseada na distância (fica mais rápido perto do jogador)
      const speed = Math.min(5, 2 + (dist * 0.1));
      
      if (dist > 1) {
        m.x += (dx / dist) * speed;
        m.y += (dy / dist) * speed;
      }
  
      // Verifica colisão com jogador
      if (player.checkCollision(m)) {
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
