export default class PaymentBox {
    constructor(x, y, width, height, img) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.img = img;
      this.money = 0;
    }
  
    addMoney(amount) {
      this.money += amount;
    }
  
    draw(ctx, cameraX, cameraY) {
      ctx.drawImage(this.img, this.x - cameraX, this.y - cameraY, this.width, this.height);
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const textX = this.x + this.width / 2 - cameraX;
      const textY = this.y - cameraY - 5; 
      ctx.fillText(`$${this.money}`, textX, textY);
    }
  
    checkCollision(player) {
      return (
        this.x < player.x + player.width &&
        this.x + this.width > player.x &&
        this.y < player.y + player.height &&
        this.y + this.height > player.y
      );
    }
  }
  