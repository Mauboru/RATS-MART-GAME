import { useRef, useEffect, useState } from 'react';
import { Player, Box, ConstructionSpot, PaymentBox, Client, GeneratorObject, Money, Stocker, Garbage } from '../models';
import { useAssets } from '../hooks/useAssets';
import { useJoystick } from '../hooks/useJoystick';
import { JoystickOverlay } from '../components/JoystickOverlay';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Cashier from '../models/Cashier';
import { drawMoneyHud, drawActionButton } from '../utils/drawMoneyHud';
import { save, load } from '../utils/saveGame'

export function GameCanvas({ assetPaths }) {
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const activeRef = useRef(null);

  const collidingGarbageRef = useRef(null);
  const progressRef = useRef(0);
  const alertShownRef = useRef(false);

  const lastTransferTimeRef = useRef(0);
  const { assets, loaded } = useAssets(assetPaths);
  const { backgroundImg, playerImg, boxImg, generatorImg, itemImg, spotImage, paymentBoxImage, moneyImg,
    clientImg, cashierImg, stockerImg, configButtonIcon, cartButtonIcon, hatButtonIcon, upgradeButtonIcon,
    dailyButtonIcon, adsButtonIcon, garbageImg } = assets;
  const { active, basePos, stickPos, directionRef, handlers, radius } = useJoystick(60);
  const maxClients = 5;
  const intervalsAddClients = [3000, 5000, 7000, 9000];

  function getWaitingPosition(targetBox, index) {
    const spacing = 15;
    const side = targetBox.x < window.innerWidth / 2 ? -1 : 1;
    const baseX = targetBox.x + targetBox.width * side + spacing * index * side;
    const offsetY = (index % 2 === 0 ? 1 : -1) * (5 + 3 * Math.floor(index / 2));
  
    return {
      x: baseX,
      y: targetBox.y + targetBox.height / 2 + offsetY + 25,
    };
  }

  // Verifica se o Joystick esta ativo
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Verifica se fullscreen esta ativo
  useEffect(() => {
    const handleFullscreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    };

    window.addEventListener('touchstart', handleFullscreen, { once: true });
    window.addEventListener('click', handleFullscreen, { once: true });

    return () => {
      window.removeEventListener('touchstart', handleFullscreen);
      window.removeEventListener('click', handleFullscreen);
    };
  }, []);

  // Lógica geral do jogo
  useEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const buttonSize = 45;
    const padding = 10;
    const buttons = [
      { x: padding, y: 10, size: buttonSize, action: () => alert('Config clicado!') },
      { x: padding, y: 10 + (buttonSize + padding) * 1, size: buttonSize, action: () => alert('Carrinho clicado!') },
      { x: padding, y: 10 + (buttonSize + padding) * 2, size: buttonSize, action: () => alert('Upgrade clicado!') },
      { x: padding, y: 10 + (buttonSize + padding) * 3, size: buttonSize, action: () => alert('Chapéu clicado!') },
      { x: padding, y: 10 + (buttonSize + padding) * 4, size: buttonSize, action: () => alert('Daily clicado!') },
      { x: padding, y: 10 + (buttonSize + padding) * 5, size: buttonSize, action: () => alert('Ads clicado!') },
    ];

    function checkButtonClick(clickX, clickY) {
      buttons.forEach(btn => {
        if (
          clickX >= btn.x &&
          clickX <= btn.x + btn.size &&
          clickY >= btn.y &&
          clickY <= btn.y + btn.size
        ) {
          btn.action();
        }
      });
    }
  
    function handleClick(event) {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      checkButtonClick(clickX, clickY);
    }
  
    canvas.addEventListener('click', handleClick);
    
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
    
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    
      const scale = window.devicePixelRatio || 1;
      canvas.width = width * scale;
      canvas.height = height * scale;
    
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(scale, scale);
    };

    resize();
    window.addEventListener('resize', resize);

    const WORLD_SIZE = 2000;

    const loadedData = load('game1');
    let initialX = 100;
    let initialY = 100;
    let initialMoney = 0;
    
    if (loadedData) {
      const { money, playerX, playerY } = loadedData;
      if (typeof playerX === 'number') initialX = playerX;
      if (typeof playerY === 'number') initialY = playerY;
      if (typeof money === 'number') initialMoney = money;
    }
    
    playerRef.current = new Player(initialX, initialY, 3, playerImg, 32, 32);
    playerRef.current.money = initialMoney;
    playerRef.current.drawWidth = 64;
    playerRef.current.drawHeight = 64;

    const constructionSpots = [
      new ConstructionSpot(200, 200, 64, 64, 100, spotImage, 1),
      new ConstructionSpot(300, 200, 64, 64, 300, spotImage, 1, false),
      new ConstructionSpot(200, 420, 64, 64, 100, spotImage, 2),
      new ConstructionSpot(300, 420, 64, 64, 150, spotImage, 2, false),
      new ConstructionSpot(400, 420, 64, 64, 250, spotImage, 2, false),
      new ConstructionSpot(55, 420, 64, 64, 200, spotImage, 3, false),
      new ConstructionSpot(55, 520, 64, 64, 100, spotImage, 4, false),
    ];

    const paymentBox = new PaymentBox(25, 350, 128, 64, moneyImg, paymentBoxImage);
    const garbage = new Garbage(250, 125, 64, 64, garbageImg);
    const clients = [];
    const generators = [];
    const boxes = [];
    const stockers = [];
    let cashier = null;

    const spawnClient = () => {
      if (clients.length >= maxClients || boxes.length === 0 || generators.length === 0) return;
      const targetBoxIndex = Math.floor(Math.random() * boxes.length);
      const client = new Client(0, 0, 1.2, boxes[targetBoxIndex], paymentBox, Math.floor(Math.random() * 3) + 1, clientImg, 32, 32);
      client.drawWidth = 64;
      client.drawHeight = 64;
      clients.push(client);
    };

    function spawnRandom() {
      spawnClient();
      const delay = intervalsAddClients[Math.floor(Math.random() * intervalsAddClients.length)];
      setTimeout(spawnRandom, delay);
    }
    spawnRandom();

    let animationFrameId;

    const maxProgress = 100;
    const progressIncrement = 1;

    const loop = () => {
      const player = playerRef.current;
      const transferDelay = 300;
      const collidables = [...boxes, paymentBox];

      if (activeRef.current) {
        player.update(directionRef.current, collidables);
      } else {
        player.update({ x: 0, y: 0 }, []);
      }

      generators.forEach(generator => generator.update());
      generators.forEach(generator => {
        generator.generatedItems = generator.generatedItems.filter(item => {
          if (item.checkCollision(player)) {
            player.addItem(item);
            return false;
          }
          return true;
        });
      });

      boxes.forEach(box => {
        if (box.checkCollision(player) && player.items.length > 0 && box.items.length < 9) {
          const now = performance.now();
          if (now - lastTransferTimeRef.current > transferDelay) {
            const item = player.items.pop();
            box.addItem(item);
            lastTransferTimeRef.current = now;
          }
        }
      });

      const boxesWithWaitingClients = new Set(clients.filter(c => c.state === 'waiting').map(c => c.targetBox));

      boxesWithWaitingClients.forEach(targetBox => {
        const waitingClients = clients.filter(c => c.targetBox === targetBox && c.state === 'waiting');
        waitingClients.forEach((client, index) => {
          client.waitPos = getWaitingPosition(targetBox, index);
      
          const centerX = targetBox.x + targetBox.width / 2;
          const centerY = targetBox.y + targetBox.height / 2;
          const dx = centerX - client.x;
          const dy = centerY - client.y;
          const length = Math.hypot(dx, dy);
      
          client.direction = length === 0 ? { x: 1, y: 0 } : { x: dx / length, y: dy / length };
          client.facing = client.direction.x >= 0 ? 'right' : 'left';
        });
      });
      
      clients.forEach(client => client.update(player, cashier));

      for (let i = clients.length - 1; i >= 0; i--) {
        if (clients[i].isDone) {
          clients.splice(i, 1);
        }
      }

      if (paymentBox.checkCollision(player) && paymentBox.money > 0) {
        paymentBox.transferTimer++;
        if (paymentBox.transferTimer >= paymentBox.transferCooldown) {
          if (paymentBox.generatedMoneys.length > 0) {
            const movingMoney = paymentBox.generatedMoneys.pop();
            paymentBox.movingMoneys.push(movingMoney);
            paymentBox.money -= 1;
          }
          paymentBox.transferTimer = 0;
        }
      } else {
        paymentBox.transferTimer = 0;
      }
      
      paymentBox.updateMovingMoneys(player);

      constructionSpots.forEach(spot => {
        spot.updateIncomingMoneys();
      
        if (!spot.transferTimer) spot.transferTimer = 0;
      
        if (!spot.isBuilt && spot.checkCollision(player) && player.money > 0) {
          spot.transferTimer++;
      
          if (spot.transferTimer >= 6) { 
            const movingMoney = new Money(
              player.x + player.width / 2, 
              player.y + 16, 
              32, 
              32, 
              moneyImg
            );
      
            player.money -= 1;
            spot.addIncomingMoney(movingMoney);
            spot.transferTimer = 0;
          }
        } else {
          spot.transferTimer = 0;
        }
      
        if (spot.isReadyToBuild()) {
          spot.isBuilt = true;
      
          switch (spot.type) {
            case 1:
              generators.push(new GeneratorObject(spot.x, spot.y, spot.width, spot.height, generatorImg, itemImg, 200));
              break;
            case 2:
              boxes.push(new Box(spot.x, spot.y + 100, spot.width, spot.height, boxImg));
              break;
            case 3:
              cashier = new Cashier(0, 0, 1.8, cashierImg, 32, 32);
              cashier.drawHeight = 64;
              cashier.drawWidth = 64;
              break;
            case 4:
              stockers.push(Object.assign(new Stocker(0, 0, 1.8, stockerImg, 32, 32), { drawHeight: 64, drawWidth: 64 }));
              break;
            default:
              break;
          }
      
          const allVisibleBuilt = constructionSpots
            .filter(s => s.isVisible)
            .every(s => s.isBuilt);
      
          if (allVisibleBuilt) {
            constructionSpots
              .filter(s => !s.isVisible)
              .forEach(s => { s.isVisible = true; });
          }
        }
      });

      if (garbage.checkCollision(player)) {
        collidingGarbageRef.current = garbage;
        if (!alertShownRef.current) {
          progressRef.current += progressIncrement;
          if (progressRef.current >= maxProgress) {
            garbage.removeItens(player);
            alertShownRef.current = true;
            progressRef.current = maxProgress;
          }
        }
      } else {
        collidingGarbageRef.current = null;
        progressRef.current = 0;
        alertShownRef.current = false;
      }
      
      const viewportWidth = canvas.width / (window.devicePixelRatio || 1);
      const viewportHeight = canvas.height / (window.devicePixelRatio || 1);

      let cameraX = player.x + 32 - viewportWidth / 2;
      let cameraY = player.y + 32 - viewportHeight / 2;

      cameraX = Math.max(0, Math.min(cameraX, WORLD_SIZE - viewportWidth));
      cameraY = Math.max(0, Math.min(cameraY, WORLD_SIZE - viewportHeight));

      ctx.clearRect(0, 0, viewportWidth, viewportHeight);

      ctx.drawImage(
        backgroundImg,
        cameraX, cameraY,
        viewportWidth, viewportHeight,
        0, 0,
        viewportWidth, viewportHeight
      );

      if (collidingGarbageRef.current) {
        const drawX = collidingGarbageRef.current.x - cameraX;
        const drawY = collidingGarbageRef.current.y - cameraY;

        ctx.fillStyle = "rgba(0, 46, 114, 0.5)";
        ctx.fillRect(drawX, drawY - 20, collidingGarbageRef.current.width, 10);

        ctx.fillStyle = "rgba(5, 83, 228, 0.7)";
        const width = (collidingGarbageRef.current.width * progressRef.current) / maxProgress;
        ctx.fillRect(drawX, drawY - 20, width, 10);
      }

      stockers.forEach(stocker => stocker.update(generators, boxes));
      constructionSpots.forEach(spot => { if (!spot.isBuilt) { spot.draw(ctx, cameraX, cameraY) } });

      const renderObjects = [
        ...boxes,
        ...generators,
        ...clients,
        ...stockers,
        garbage,
        player,
        paymentBox,
      ];

      if (cashier) {
        renderObjects.push(cashier);
        cashier.update({ x: 35, y: 410 });
      }

      save('game1', playerRef.current.money, playerRef.current.x, playerRef.current.y, ['Cashier1'], ['Stocker1'], ['Genertaor1'], ['Box1'], ['Spot1']);

      renderObjects.sort((a, b) => a.getBaseY() - b.getBaseY());
      renderObjects.forEach(obj => obj.draw(ctx, cameraX, cameraY));

      const allIncomingMoney = [];
      constructionSpots.forEach(spot => allIncomingMoney.push(...spot.incomingMoneys));
      allIncomingMoney.forEach(money => money.draw(ctx, cameraX, cameraY));

      drawMoneyHud(ctx, player.money, 0, viewportWidth);

      let startY = 10;

      drawActionButton(ctx, configButtonIcon, padding, startY, buttonSize);
      startY += buttonSize + padding;

      drawActionButton(ctx, cartButtonIcon, padding, startY, buttonSize);
      startY += buttonSize + padding;

      drawActionButton(ctx, upgradeButtonIcon, padding, startY, buttonSize);
      startY += buttonSize + padding;

      drawActionButton(ctx, hatButtonIcon, padding, startY, buttonSize);
      startY += buttonSize + padding;

      drawActionButton(ctx, dailyButtonIcon, padding, startY, buttonSize);
      startY += buttonSize + padding; 

      drawActionButton(ctx, adsButtonIcon, padding, startY, buttonSize);

      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [loaded, directionRef, backgroundImg, playerImg]);

  return (
    <>
      <div
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          background: '#000',
          touchAction: 'none',
          userSelect: 'none',
          overflow: 'hidden', 
        }}
        {...handlers}
      >
        {loaded ? (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              touchAction: 'none',
              imageRendering: 'pixelated',
            }}
          />
        ) : (
          <LoadingSpinner />
        )}
  
        <JoystickOverlay
          active={active}
          basePos={basePos}
          stickPos={stickPos}
          radius={radius}
        />
      </div>
    </>
  );
}