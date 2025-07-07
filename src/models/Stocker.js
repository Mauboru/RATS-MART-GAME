import Entidade from './Entidade';

export default class Stocker extends Entidade {
    constructor(x, y, speed, spriteSheet, frameWidth, frameHeight) {
        super(x, y, speed, spriteSheet, frameWidth, frameHeight);

        this.frameCount = 4;
        this.frameDelay = 8;

        this.direction = { x: 0, y: 0 };
        this.state = 'idle';
        this.timerStaminaMax = 1000;
        this.timerStamina = this.timerStaminaMax;

        this.width = frameWidth;
        this.height = frameHeight;

        this.generatorTarget = null;
        this.boxTarget = null;
        this.maxItems = 3;
        this.items = [];
    }

    update(generators, boxes, garbage) {
        if (this.timerStamina <= 0) {
            this.state = "tired";
        } else {
            this.timerStamina--;
        }

        if (this.direction.x > 0) this.facing = 'right';
        else if (this.direction.x < 0) this.facing = 'left';

        switch (this.state) {
            case 'idle':
                if (this.hasAvailableBox(boxes)) {
                    this.chooseGenerator(generators);
                } else {
                    this.state = 'waiting';
                }
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
                    } else if (this.items.length > 0) {
                        this.state = 'movingToGarbage';
                    } else {
                        this.state = 'waiting';
                    }
                }
                break;

            case 'waiting':
                if (this.items.length > 0) {
                    if (this.hasAvailableBox(boxes)) {
                        this.chooseBox(boxes);
                    } else {
                        this.state = 'movingToGarbage';
                    }
                } else {
                    if (this.hasAvailableBox(boxes)) {
                        this.chooseGenerator(generators);
                    }
                }
                break;

            case 'movingToGarbage':
                this.moveTo(garbage);
                if (this.isAtTarget(garbage, 5)) {
                    this.state = 'discard';
                }
                break;

            case 'discard':
                if (garbage && this.items.length > 0) {
                    this.items.pop();
                }

                if (this.items.length <= 0) {
                    if (this.hasAvailableBox(boxes)) {
                        this.chooseGenerator(generators);
                    } else {
                        this.state = 'waiting';
                    }
                }
                break;

            case 'tired':
                // Sprite muda aqui
                break;
        }

        this.updateAnimation();
    }

    checkCollisionWithPlayer(player) {
        return (
            player.x < (this.x - 32) + this.width &&
            player.x + player.drawWidth > (this.x + 32) &&
            player.y < (this.y - 32) + this.height &&
            player.y + player.drawHeight > (this.y + 32)
        );
    }

    chooseGenerator(generators) {
        if (generators.length === 0) {
          this.state = 'waiting';
          return;
        }
        
        this.generatorTarget = generators.find(g => g.hasItem()) || generators[0];
        this.state = 'movingToGenerator';
    }
      
    chooseBox(boxes) {
    const box = boxes.find(b => !b.isFull());
    if (box) {
        this.boxTarget = box;
        this.state = 'movingToBox';
    } else {
        this.state = 'movingToGarbage';
    }
    }

    hasAvailableBox(boxes) {
        return boxes.some(b => !b.isFull());
    }

    findOtherBox(boxes) {
        return boxes.find(b => b !== this.boxTarget && !b.isFull());
    }

    moveTo(target) {
        if (!target) {
          this.state = 'waiting'; // Volta para estado seguro
          return;
        }
      
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance > 1) {
          this.direction = { x: dx / distance, y: dy / distance };
          this.x += this.direction.x * this.speed;
          this.y += this.direction.y * this.speed;
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
        let row;

        switch (this.state) {
            case 'idle':
                row = 0;
                break;
            case 'tired':
                row = 2;
                break;
            default:
                row = 1;
                break;
        }

        super.draw(ctx, cameraX, cameraY, row, this.items);
    }
}
