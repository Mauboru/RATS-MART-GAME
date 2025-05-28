import { useRef, useEffect } from 'react';
import { useJoystick } from '../hooks/useJoystick';
import { JoystickOverlay } from '../components/JoystickOverlay';
import { Player } from '../models/Player';
import { PaymentBox } from '../models/PaymentBox';
import { ConstructionSpot } from '../models/ConstructionSpot';
import { Client } from '../models/Client';
import { Box } from '../models/Box';
import { GeneratorObject } from '../hooks/generatorObject';

export function GameCanvas({ backgroundImg, playerImg, boxImg, generatorImg, itemImg, spotImage }) {
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const lastTransferTimeRef = useRef(0);

  const { active, basePos, stickPos, directionRef, handlers, radius } = useJoystick(60);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  function getWaitingPosition(targetBox, index) {
    const spacing = 15;
    const side = targetBox.x < window.innerWidth / 2 ? -1 : 1;
    const baseX = targetBox.x + targetBox.width * side + spacing * index * side;
    const offsetY = (index % 2 === 0 ? 1 : -1) * (5 + 3 * Math.floor(index / 2));
  
    return {
      x: baseX,
      y: targetBox.y + targetBox.height / 2 + offsetY,
    };
  }

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

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
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

    playerRef.current = new Player(100, 100, 3, playerImg, 32, 32);
    playerRef.current.drawWidth = 64;
    playerRef.current.drawHeight = 64;

    const constructionSpots = [
      new ConstructionSpot(200, 200, 64, 64, 100, spotImage, 1),
      new ConstructionSpot(300, 200, 64, 64, 350, spotImage, 1, false),
      new ConstructionSpot(200, 420, 64, 64, 100, spotImage, 2),
      new ConstructionSpot(200, 520, 64, 64, 450, spotImage, 2, false),
      new ConstructionSpot(200, 620, 64, 64, 800, spotImage, 2, false),
    ];

    const paymentBox = new PaymentBox(100, 350, 64, 64, boxImg);
    const clients = [];
    const generators = [];
    const boxes = [];

    const spawnClient = () => {
      if (clients.length >= 5) return;
      if (boxes.length === 0) return;
    
      const targetBoxIndex = Math.floor(Math.random() * boxes.length); 
      const client = new Client(0, 0, 1.2, boxes[targetBoxIndex], paymentBox, Math.floor(Math.random() * 3) + 1, playerImg, 32, 32);
      clients.push(client);
    };

    let clientSpawnInterval = setInterval(() => {
      spawnClient();
    }, Math.random() * 3000 + 2000);

    let animationFrameId;

    const loop = () => {
      const player = playerRef.current;

      if (activeRef.current) {
        player.update(directionRef.current);
      } else {
        player.update({ x: 0, y: 0 });
      }

      generators.forEach(generator => generator.update());

      generators.forEach(generator => { generator.generatedItems = generator.generatedItems.filter(item => {
          if (item.checkCollision(player)) {
            player.addItem(item);
            return false;
          }
          return true;
        });
      });

      const transferDelay = 300;

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

      clients.forEach(client => {
        const sameBoxClients = clients.filter(c => c.targetBox === client.targetBox);
      
        sameBoxClients.sort((a, b) => {
          const distA = Math.hypot(a.x - a.targetBox.x, a.y - a.targetBox.y);
          const distB = Math.hypot(b.x - b.targetBox.x, b.y - b.targetBox.y);
          return distA - distB;
        });
      
        const index = sameBoxClients.indexOf(client);
      
        if (client.state === 'waiting') {
          client.waitPos = getWaitingPosition(client.targetBox, index);
      
          const centerX = client.targetBox.x + client.targetBox.width / 2;
          const centerY = client.targetBox.y + client.targetBox.height / 2;
          const dx = centerX - client.x;
          const dy = centerY - client.y;
          const length = Math.hypot(dx, dy);
      
          client.direction = length === 0 ? { x: 1, y: 0 } : { x: dx / length, y: dy / length };
      
          client.facing = client.direction.x >= 0 ? 'right' : 'left';
        }
      
        client.update();
      });
      
      for (let i = clients.length - 1; i >= 0; i--) {
        if (clients[i].isDone) {
          clients.splice(i, 1);
        }
      }

      if (paymentBox.checkCollision(player) && paymentBox.money > 0) {
        const transferAmount = Math.min(1, paymentBox.money);
        player.money += transferAmount;
        paymentBox.money -= transferAmount;
      }

      constructionSpots.forEach(spot => {
        if (!spot.isBuilt && spot.checkCollision(player)  && player.money > 0) {
          const transferAmount = Math.min(1, player.money);
          player.money -= transferAmount;
          spot.cost -= transferAmount;
      
          if (spot.cost <= 0) {
            spot.isBuilt = true;
      
            switch (spot.type) {
              case 1:
                generators.push(
                  new GeneratorObject(
                    spot.x,
                    spot.y,
                    spot.width,
                    spot.height,
                    generatorImg,
                    itemImg,
                    200
                  )
                );
                break;
              case 2:
                boxes.push(new Box(spot.x, spot.y, spot.width, spot.height, boxImg));
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
        }
      });

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

      boxes.forEach(box => box.draw(ctx, cameraX, cameraY));
      generators.forEach(generator => generator.draw(ctx, cameraX, cameraY));
      paymentBox.draw(ctx, cameraX, cameraY);
      clients.forEach(client => client.draw(ctx, cameraX, cameraY));
      constructionSpots.forEach(spot => {if (!spot.isBuilt) {spot.draw(ctx, cameraX, cameraY)}});      
      player.draw(ctx, cameraX, cameraY);

      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText(`Dinheiro: $${player.money}`, 65, 30);

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [directionRef, backgroundImg, playerImg]);

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#000',
          touchAction: 'none',
          userSelect: 'none',
        }}
        {...handlers}
      >
        <canvas
          ref={canvasRef}
          style={{
            touchAction: 'none',
            imageRendering: 'pixelated',
          }}
        />
      </div>

      <JoystickOverlay
        active={active}
        basePos={basePos}
        stickPos={stickPos}
        radius={radius}
      />
    </>
  );
}
