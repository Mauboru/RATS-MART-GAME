export default class ConstructionSpot {
  constructor(x, y, width, height, cost, image, type, isVisible = true) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.cost = cost;
    this.originalCost = cost;
    this.lastTransferTime = null;
    this.moneyPool = 0;
    this.image = image;
    this.type = type;
    this.isBuilt = false;
    this.isVisible = isVisible;
    this.incomingMoneys = [];
  }

  checkCollision(player) {
    if (!this.isVisible) return false;

    return (
      player.x < this.x + this.width &&
      player.x + player.drawWidth > this.x &&
      player.y < this.y + this.height &&
      player.y + player.drawHeight > this.y
    );
  }

  addIncomingMoney(money) {
    this.incomingMoneys.push(money);
  }

  updateIncomingMoneys() {
    const MONEY_SPEED = 4;
  
    for (let i = this.incomingMoneys.length - 1; i >= 0; i--) {
      const money = this.incomingMoneys[i];
      
      // Calcula direção ao centro do spot
      const targetX = this.x + this.width/2;
      const targetY = this.y + this.height/2;
      const dx = targetX - money.x;
      const dy = targetY - money.y;
      const distance = Math.sqrt(dx*dx + dy*dy);
  
      if (distance > 5) {
        // Movimento suave
        money.x += (dx/distance) * MONEY_SPEED;
        money.y += (dy/distance) * MONEY_SPEED;
      } else {
        // Remove a moeda (o valor já foi debitado)
        this.incomingMoneys.splice(i, 1);
      }
    }
  }

  isReadyToBuild() {
    return this.cost <= 0 && !this.isBuilt;
  }

  draw(ctx, cameraX, cameraY) {
    if (!this.isBuilt && this.isVisible && this.image) {
      // Desenha o spot
      ctx.drawImage(this.image, this.x - cameraX, this.y - cameraY, this.width, this.height);
    
      // Desenha as moedas em movimento
      this.incomingMoneys.forEach(money => {
        money.draw(ctx, cameraX, cameraY);
      });
    
      // Texto do custo
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`$${this.cost}`,
      this.x + this.width / 2 - cameraX,
      this.y + this.height + 25 - cameraY);
    
      // Barra de progresso (opcional)
      const progressWidth = 50;
      const progressHeight = 5;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(
        this.x + this.width / 2 - progressWidth / 2 - cameraX,
        this.y + this.height + 5 - cameraY,
        progressWidth,
        progressHeight
      );
      ctx.fillStyle = 'gold';
      ctx.fillRect(
        this.x + this.width / 2 - progressWidth / 2 - cameraX,
        this.y + this.height + 5 - cameraY,
        progressWidth * (1 - this.cost / this.originalCost),
        progressHeight
      );
    }
  }
}