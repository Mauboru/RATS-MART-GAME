export default class UpgradeWindow {
    constructor(player, assets, x = 60, y = 250, width = 280, height = 220) {
        this.player = player;
        this.assets = assets;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visible = false;
        this.upgradeCost = 50;
        this.padding = 15;
        this.buttonHeight = 40;
    }

    toggle() {
        this.visible = !this.visible;
    }

    draw(ctx) {
        if (!this.visible) return;

        // Estilo moderno de janela
        ctx.save();
        
        // Fundo com borda arredondada
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        ctx.fillStyle = 'rgba(40, 40, 45, 0.95)';
        ctx.fill();
        
        // Borda gradiente
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, '#4a7dff');
        gradient.addColorStop(1, '#8a2be2');
        ctx.lineWidth = 3;
        ctx.strokeStyle = gradient;
        ctx.stroke();
        
        // Cabeçalho
        ctx.fillStyle = 'rgba(30, 30, 35, 0.9)';
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, 40, [10, 10, 0, 0]);
        ctx.fill();
        
        // Ícone e título
        if (this.assets.upgradeIcon) {
            ctx.drawImage(this.assets.upgradeIcon, this.x + 10, this.y + 8, 24, 24);
        }
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px "Arial Rounded MT", Arial';
        ctx.fillText('UPGRADE DE CAPACIDADE', this.x + 136, this.y + 24);
        
        // Botão de fechar
        ctx.fillStyle = '#ff5a5a';
        ctx.beginPath();
        ctx.arc(this.x + this.width - 25, this.y + 20, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✕', this.x + this.width - 25, this.y + 24);
        ctx.textAlign = 'left';
        
        // Conteúdo
        const contentY = this.y + 70;
        
        // Ícone de capacidade
        if (this.assets.bagIcon) {
            ctx.drawImage(this.assets.bagIcon, this.x + this.padding, contentY, 32, 32);
        }
        ctx.fillStyle = '#ddd';
        ctx.font = '16px "Arial Rounded MT", Arial';
        ctx.fillText(`Capacidade Atual: ${this.player.maxItems}`, this.x + 50, contentY + 22);
        
        // Ícone de preço
        if (this.assets.moneyIcon) {
            ctx.drawImage(this.assets.moneyIcon, this.x + this.padding, contentY + 40, 32, 32);
        }
        ctx.fillText(`Próximo Upgrade: $${this.upgradeCost}`, this.x + 50, contentY + 62);
        
        // Botão de compra
        const buttonY = this.y + this.height - this.buttonHeight - this.padding;
        const canAfford = this.player.money >= this.upgradeCost;
        
        ctx.fillStyle = canAfford ? '#4CAF50' : '#f44336';
        ctx.beginPath();
        ctx.roundRect(this.x + this.padding, buttonY, this.width - this.padding*2, this.buttonHeight, 8);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px "Arial Rounded MT", Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            canAfford ? 'COMPRAR UPGRADE' : 'DINHEIRO INSUFICIENTE', 
            this.x + this.width/2, 
            buttonY + 26
        );
        ctx.textAlign = 'left';
        
        ctx.restore();
    }

    handleClick(x, y) {
        if (!this.visible) return;

        // Verificar clique no botão de fechar
        const closeButtonX = this.x + this.width - 25;
        const closeButtonY = this.y + 20;
        const closeButtonRadius = 12;
        
        if (Math.sqrt((x - closeButtonX) ** 2 + (y - closeButtonY) ** 2) <= closeButtonRadius) {
            this.visible = false;
            return;
        }

        // Verificar clique no botão de compra
        const buttonY = this.y + this.height - this.buttonHeight - this.padding;
        const buttonRect = {
            x: this.x + this.padding,
            y: buttonY,
            width: this.width - this.padding*2,
            height: this.buttonHeight
        };
        
        if (x >= buttonRect.x && x <= buttonRect.x + buttonRect.width &&
            y >= buttonRect.y && y <= buttonRect.y + buttonRect.height) {
            
            if (this.player.money >= this.upgradeCost) {
                this.player.money -= this.upgradeCost;
                this.player.maxItems += 1;
                this.upgradeCost = Math.floor(this.upgradeCost * 1.5);
                
                // Efeito visual (poderia adicionar partículas ou animação aqui)
            }
        }
    }
}