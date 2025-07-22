import { Player, Box, ConstructionSpot, ProcessingGenerator, PaymentBox, Client, GeneratorObject, Stocker, Garbage, Cashier, Money} from '../models';
import { save } from '../utils/saveGame';

export default class GameManager {
  constructor(assets) {
    this.assets = assets;
    this.player = null;
    this.paymentBox = null;
    this.garbage = null;
    this.clients = [];
    this.generators = [];
    this.processingGenerators = [];
    this.boxes = [];
    this.stockers = [];
    this.cashier = null;
    this.constructionSpots = [];
    this.worldSize = 2000;
    this.maxClients = 3;
    this.clientIntervals = [3000, 5000, 7000, 9000];
    this.clientSpawnTimeout = null;
    this.create = false;
    this.unlockedSpotGroups = 0;

    this.spotGroupsToUnlock = [
      [1, 3],
      [0],
      [2],
      [4],
      [5],
      [7, 6]
      // [0, 1, 2, 3, 4, 5, 6, 7]
    ];
  }

  // UPDATES
  update() {
    this.updateBoxes();
    this.updateClients();
    this.updatePaymentBox();
    this.updateConstructionSpots();
    this.updateStockers();
    this.updateCashier();
  }

  updateBoxes() {
    const now = performance.now();
    this.boxes.forEach(box => {
      if (box.checkCollision(this.player) && this.player.items.length > 0 && box.items.length < 9) {
        if (now - this.lastTransferTime > 300) { // 300ms delay
          const item = this.player.items.pop();
          box.addItem(item);
          this.lastTransferTime = now;
        }
      }
    });
  }

  updateClients() {
    this.clients = this.clients.filter(client => !client.isDone);

    const spacingMin = 24;
    const spacingMax = 40;

    const groupByState = {
      waiting: [],
      waitingForPlayer: [],
    };

    this.clients.forEach(client => {
      if (client.state === 'waiting') groupByState.waiting.push(client);
      if (client.state === 'waitingForPlayer') groupByState.waitingForPlayer.push(client);
    });

    const positionQueue = (clients, box) => {
      if (clients.length === 0) return;

      const firstClient = clients[0];
      const isRightSide = firstClient.x >= box.x;
      const direction = isRightSide ? 1 : -1;

      let cursorX = isRightSide ? box.x + box.width : box.x - spacingMin;

      clients.forEach(client => {
        const offset = Math.floor(Math.random() * (spacingMax - spacingMin + 1)) + spacingMin;

        client.waitPos = {
          x: cursorX,
          y: box.y + 32,
        };

        client.facing = isRightSide ? 'left' : 'right';
        cursorX += direction * offset;
      });
    };

    const groupAndPositionByQueue = (clients, boxPropName) => {
      const grouped = {};
      clients.forEach(c => {
        const key = c.queue || c[boxPropName]?.type;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(c);
      });

      Object.values(grouped).forEach(group => {
        const refBox = group[0][boxPropName];
        positionQueue(group, refBox);
      });
    };

    groupAndPositionByQueue(groupByState.waiting, 'targetBox');
    groupAndPositionByQueue(groupByState.waitingForPlayer, 'paymentBox');

    this.clients.forEach(client => client.update(this.player, this.cashier));
  }
  
  updatePaymentBox() {
    this.paymentBox.updateMovingMoneys(this.player);
  }

  updateConstructionSpots() {
    const BASE_COOLDOWN = 300; 
    const MIN_COOLDOWN = 100;
    const ACCELERATION_RATE = 50;
  
    if (this.unlockedSpotGroups < this.spotGroupsToUnlock.length) {
      const currentGroup = this.spotGroupsToUnlock[this.unlockedSpotGroups];
  
      if (currentGroup.every(idx => this.constructionSpots[idx].isBuilt)) {
        this.unlockedSpotGroups++;
  
        const nextGroup = this.spotGroupsToUnlock[this.unlockedSpotGroups];
        if (nextGroup) {
          nextGroup.forEach(idx => {
            if (this.constructionSpots[idx]) {
              this.constructionSpots[idx].isVisible = true;
            }
          });
        }
      }
    }
  
    this.constructionSpots.forEach(spot => {
      if (!spot.isVisible) return;
  
      if (!spot.isBuilt && spot.checkCollision(this.player) && this.player.money > 0) {
        const now = Date.now();
  
        if (!spot.collisionStartTime) {
          spot.collisionStartTime = now;
        }
        const collisionDuration = (now - spot.collisionStartTime) / 1000;
  
        const dynamicCooldown = Math.max(
          MIN_COOLDOWN,
          BASE_COOLDOWN - (ACCELERATION_RATE * collisionDuration)
        );
  
        if (!spot.lastTransferTime || now - spot.lastTransferTime >= dynamicCooldown) {
          if (this.player.money > 0 && spot.cost > 0) {
            this.transferMoneyToSpot(spot);
            spot.lastTransferTime = now;
          }
        }
      } else {
        spot.collisionStartTime = null;
      }
  
      spot.updateIncomingMoneys();
  
      if (spot.isReadyToBuild()) {
        this.buildSpot(spot);
      }
    });
  }

  updateStockers() {
    this.stockers.forEach(stocker => {
      stocker.update(this.generators, this.boxes, this.garbage);
      
      if (stocker.checkCollisionWithPlayer(this.player) && stocker.state === "tired") {
        stocker.state = "idle";
        stocker.timerStamina = 2000;
      }
    });
  }

  updateCashier() {
    if (!this.cashier) return;
    this.cashier.update(this.paymentBox);
  }

  updateGarbage(deltaTime) {
    if (this.garbage.checkCollision(this.player)) {
      this.garbage.processPlayerInteraction(this.player, deltaTime);
    } else {
      this.garbage.resetCharge();
    }
  }
  
  transferMoneyToSpot(spot) { 
    const newMoney = new Money(
      this.player.x + 16,
      this.player.y + 42,
      32, 32,
      this.assets.moneyImg
    );
    
    this.player.money -= 1;
    spot.cost -= 1;
    
    spot.addIncomingMoney(newMoney);
  }

  buildSpot(spot) {
    spot.isBuilt = true;
    
    switch (spot.type) {
      case 1: // Generator
        this.generators.push(new GeneratorObject(
          spot.x, spot.y, 
          spot.width, spot.height, 
          this.assets.arvoreBananaImg, 
          this.assets.bananaImg, 
          200, 
          3,          
          'banana' 
        ));
        break;
      
      case 6: // Generator
        this.generators.push(new GeneratorObject(
          spot.x, spot.y, 
          spot.width, spot.height, 
          this.assets.generatorImg, 
          this.assets.itemImg, 
          200, 
          3,          
          'maca' 
        ));
        break;
      
      case 7: // ProcessingGenerator (Maçã → Suco)
      this.processingGenerators.push(new ProcessingGenerator(
          spot.x, spot.y + 100, 128, 64,
          this.assets.juiceMachineImg,
          'maca',             // input
          'suco',             // output
          4,                  // precisa de 3 maçãs
          this.assets.sucoImg // sprite do suco
        ));
        break;
        
      case 2: // Box
        const boxBanana = new Box(spot.x, spot.y + 100, spot.width, spot.height, this.assets.bananaBoxImg, 'banana');
        this.boxes.push(boxBanana);
        break;
      
      case 5: // Box
        const boxMaca = new Box(spot.x, spot.y + 100, spot.width, spot.height, this.assets.boxImg, 'maca');
        this.boxes.push(boxMaca);
        break;
      
      case 8: // Box
        const boxSuco = new Box(spot.x, spot.y + 100, spot.width, spot.height, this.assets.boxImg, 'suco');
        this.boxes.push(boxSuco);
        break;
        
      case 3: // Cashier
        this.cashier = new Cashier(0, 0, 1.8, this.assets.cashierImg, 32, 32);
        this.cashier.drawWidth = 64;
        this.cashier.drawHeight = 64;
        break;
        
      case 4: // Stocker
        const stocker = new Stocker(0, 0, 1.8, this.assets.stockerImg, 32, 32);
        stocker.drawWidth = 64;
        stocker.drawHeight = 64;
        this.stockers.push(stocker);
        break;
    }
  }
  
  initialize(loadedData) {
    this.loadGameData(loadedData);
  
    this.spotGroupsToUnlock[0].forEach(idx => {
      if (this.constructionSpots[idx]) {
        this.constructionSpots[idx].isVisible = true;
      }
    });
  
    this.setupEventListeners();
    this.startClientSpawning();
  }

  loadGameData(loadedData) {
    const initialX = loadedData?.playerX ?? 100;
    const initialY = loadedData?.playerY ?? 100;
    const initialMoney = loadedData?.money ?? 100;
    const initialMaxItems = loadedData?.maxItems ?? 3;

    this.player = new Player(initialX, initialY, 3, this.assets.playerImg01 , 305, 445);
    this.player.money = initialMoney;
    this.player.maxItems = initialMaxItems;
    this.player.drawWidth = 64;
    this.player.drawHeight = 96;

    this.paymentBox = new PaymentBox(25, 350, 128, 64, this.assets.moneyImg, this.assets.paymentBoxImage);
    if (loadedData?.paymentBox?.money) {
      this.paymentBox.setMoney(loadedData.paymentBox.money);
      this.paymentBox.rebuildMoneyStack();
    }

    this.garbage = new Garbage(120, 125, 64, 64, this.assets.garbageImg);
    this.constructionSpots = this.createConstructionSpots(loadedData);
  }

  createConstructionSpots(loadedData) {
    if (loadedData?.spots?.length > 0) {
      return loadedData.spots.map(spotData => 
        new ConstructionSpot(
          spotData.x,
          spotData.y,
          spotData.width,
          spotData.height,
          spotData.cost,
          this.assets.spotImage,
          spotData.type,
          spotData.isVisible ?? true,
          spotData.isBuilt ?? false,
          spotData.incomingMoneys ?? [],
          spotData.transferTimer ?? 0
        )
      );
    }
    
    return [
      new ConstructionSpot(300, 200, 64, 64, 100, this.assets.spotImage, 1, false), // bananeira
      new ConstructionSpot(220, 200, 64, 64, 50, this.assets.spotImage, 6, false), // macieira
      new ConstructionSpot(220, 420, 64, 64, 100, this.assets.spotImage, 2, false), // caixa de banana
      new ConstructionSpot(330, 480, 64, 64, 50, this.assets.spotImage, 5, false), // caixa de maças
      new ConstructionSpot(55, 420, 64, 64, 200, this.assets.spotImage, 3, false), // caixa
      new ConstructionSpot(55, 220, 64, 64, 250, this.assets.spotImage, 4, false), // estoquista
      new ConstructionSpot(220, 720, 64, 64, 300, this.assets.spotImage, 7, false), // gerador de sucos
      new ConstructionSpot(420, 620, 64, 64, 350, this.assets.spotImage, 8, false), // caixa de sucos

      // new ConstructionSpot(300, 200, 64, 64, 0, this.assets.spotImage, 1, false), // bananeira
      // new ConstructionSpot(220, 200, 64, 64, 0, this.assets.spotImage, 6, false), // macieira
      // new ConstructionSpot(220, 420, 64, 64, 0, this.assets.spotImage, 2, false), // caixa de banana
      // new ConstructionSpot(300, 420, 64, 64, 0, this.assets.spotImage, 5, false), // caixa de maças
      // new ConstructionSpot(55, 420, 64, 64, 0, this.assets.spotImage, 3, false), // caixa
      // new ConstructionSpot(55, 220, 64, 64, 0, this.assets.spotImage, 4, false), // estoquista
      // new ConstructionSpot(220, 720, 64, 64, 0, this.assets.spotImage, 7, false), // gerador de sucos
      // new ConstructionSpot(420, 620, 64, 64, 0, this.assets.spotImage, 8, false), // caixa de sucos
    ];
  }

  canCreateSpawn() {
    return this.create;
  }

  startClientSpawning() {
    const spawnClient = () => {
      const delay = this.clientIntervals[Math.floor(Math.random() * this.clientIntervals.length)];
  
      if (this.boxes.length === 0 || this.generators.length === 0) {
        this.clientSpawnTimeout = setTimeout(spawnClient, delay);
        return;
      }
  
      const newMaxClients = this.maxClients * this.boxes.length;
      if (this.clients.length < newMaxClients) {
        const targetBox = this.boxes[Math.floor(Math.random() * this.boxes.length)];
        const client = new Client(
          0, 0, 1.2,
          targetBox,
          this.paymentBox,
          Math.floor(Math.random() * 3) + 1,
          this.assets.clientImg,
          32, 32
        );
  
        client.drawWidth = 64;
        client.drawHeight = 64;
        this.clients.push(client);
      }
  
      this.clientSpawnTimeout = setTimeout(spawnClient, delay);
    };
  
    spawnClient();
  }  

  stopClientSpawning() {
    if (this.clientSpawnTimeout) {
      clearTimeout(this.clientSpawnTimeout);
    }
  }

  setupEventListeners() {
    window.addEventListener('beforeunload', this.saveGame.bind(this));
  }

  saveGame() {
    const serializedBoxes = this.boxes.map(box => ({
      ...box,
      itemCount: box.items?.length ?? 0
    }));
    
    save(
      'GameSave03',
      this.player.money,
      this.player.x,
      this.player.y,
      this.player.maxItems,
      { money: this.paymentBox?.money ?? 0 },
      serializedBoxes,
      this.constructionSpots
    );
  }

  cleanup() {
    this.stopClientSpawning();
    window.removeEventListener('beforeunload', this.saveGame.bind(this));
  }
}