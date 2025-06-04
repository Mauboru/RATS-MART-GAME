import Entidade from './Entidade';

export default class Stocker extends Entidade {
    constructor(x, y, speed, spriteSheet, frameWidth, frameHeight) {
        super(x, y, speed, spriteSheet, frameWidth, frameHeight);

        this.frameCount = 4;   
        this.frameDelay = 8;  

        this.direction = { x: 0, y: 0 };
        this.state = 'idle';

        this.width = frameWidth;
        this.height = frameHeight;
        
        this.generatorTarget = null;
        this.boxTarget = null;       
        this.itemsCollected = 0;     
        this.maxItems = 3;   
        this.items = [];
    }

    update(generators, boxes) {
        if (this.direction.x > 0) this.facing = 'right';
        else if (this.direction.x < 0) this.facing = 'left';

        switch (this.state) {
            case 'idle':
                this.chooseGenerator(generators);
                break;
    
            case 'movingToGenerator':
                this.moveTo(this.generatorTarget);
                if (this.isAtTarget(this.generatorTarget, 55)) {
                    this.state = 'collecting';
                }
                break;
    
            case 'collecting':
                if (this.generatorTarget.hasItem() && this.items.length < this.maxItems) {
                    const item = this.generatorTarget.takeItem();
                    if (item) this.items.push(item);
                    if (this.items.length >= this.maxItems) {
                    this.chooseBox(boxes);
                    }
                } else {
                    this.state = 'waiting';
                }
            break;
    
            case 'movingToBox':
                this.moveTo(this.boxTarget);
                if (this.isAtTarget(this.boxTarget, 45)) {
                    this.state = 'depositing';
                }
                break;
    
            case 'depositing':
                if (this.boxTarget && !this.boxTarget.isFull() && this.items.length > 0) {
                    const item = this.items.pop();
                    this.boxTarget.addItem(item);
                    if (this.items.length <= 0) {
                    this.chooseGenerator(generators);
                    }
                } else {
                    const otherBox = this.findOtherBox(boxes);
                    if (otherBox) {
                    this.boxTarget = otherBox;
                    this.state = 'movingToBox';
                    } else {
                    this.state = 'waiting';
                    }
                }
                break;
    
            case 'waiting':
                if (this.generatorTarget && this.generatorTarget.hasItem()) {
                    this.state = 'collecting';
                } else if (this.boxTarget && !this.boxTarget.isFull() && this.itemsCollected > 0) {
                    this.state = 'depositing';
                }
                break;
        }
        this.updateAnimation();
    }

    chooseGenerator(generators) {
        // Escolhe o gerador com mais itens ou aleatório.
        this.generatorTarget = generators[Math.floor(Math.random() * generators.length)];
        this.state = 'movingToGenerator';
    }
    
    chooseBox(boxes) {
        // Escolhe primeira caixa não cheia.
        const box = boxes.find(b => !b.isFull());
        if (box) {
            this.boxTarget = box;
            this.state = 'movingToBox';
        } else {
            this.state = 'waiting';
        }
    }
    
    findOtherBox(boxes) {
        return boxes.find(b => b !== this.boxTarget && !b.isFull());
    }
    
    moveTo(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 1) {
            this.direction = { x: dx / distance, y: dy / distance };
            this.x += this.direction.x * this.speed;
            this.y += this.direction.y * this.speed;
            this.state = this.state.includes('Box') ? 'movingToBox' : 'movingToGenerator';
        } else {
            this.direction = { x: 0, y: 0 };
        }
    }
    
    isAtTarget(target, buffer = 10) {
        return Math.hypot(target.x - this.x, target.y - this.y) < buffer;
    }

    getBaseY() {
        return this.y + this.height;
    }

    draw(ctx, cameraX, cameraY) {
        const row = this.state === 'idle' ? 0 : 1;
        super.draw(ctx, cameraX, cameraY, row, this.items);
    }
}
