import { useRef, useEffect } from 'react';
import { useJoystick } from '../hooks/useJoystick';
import { JoystickOverlay } from '../components/JoystickOverlay';
import { Player } from '../models/Player';
import { PaymentBox } from '../models/PaymentBox';
import { Client } from '../models/Client';
import { Box } from '../models/Box';
import { GeneratorObject } from '../hooks/generatorObject';

export function GameCanvas({ backgroundImg, playerImg, boxImg, generatorImg, itemImg }) {
  const canvasRef = useRef(null);
  const playerRef = useRef(null);

  const { active, basePos, stickPos, directionRef, handlers, radius } = useJoystick(60);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const aspectRatio = 9 / 16;

    const resize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let width = windowWidth;
      let height = windowWidth / aspectRatio;

      if (height > windowHeight) {
        height = windowHeight;
        width = height * aspectRatio;
      }

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

    const boxes = [
      new Box(300, 300, 64, 64, boxImg),
      new Box(400, 300, 64, 64, boxImg),
      new Box(500, 300, 64, 64, boxImg),
    ]
    const generators = [
      new GeneratorObject(500, 500, 64, 64, generatorImg, itemImg, 200),
      new GeneratorObject(700, 300, 64, 64, generatorImg, itemImg, 200),
      new GeneratorObject(200, 200, 64, 64, generatorImg, itemImg, 200),
    ];

    const paymentBox = new PaymentBox(800, 800, 64, 64, boxImg);
    const clients = [];

    const spawnClient = () => {
      const targetBoxIndex = Math.floor(Math.random() * 3);
      const client = new Client(
        0,
        0,
        1,
        boxes[targetBoxIndex],
        paymentBox,
        Math.floor(Math.random() * 3) + 1,
        playerImg,
        32,
        32
      );
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
        if (box.checkCollision(player)) {
          while (player.items.length > 0 && box.items.length < 9) {
            const item = player.items.pop();
            box.addItem(item);
          }
        }
      });
      
      clients.forEach(client => client.update());

      for (let i = clients.length - 1; i >= 0; i--) {
        if (clients[i].isDone) {
          clients.splice(i, 1);
        }
      }

      if (paymentBox.checkCollision(player)) {
        player.money += paymentBox.money;
        paymentBox.money = 0;
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

      boxes.forEach(box => box.draw(ctx, cameraX, cameraY));
      generators.forEach(generator => generator.draw(ctx, cameraX, cameraY));
      paymentBox.draw(ctx, cameraX, cameraY);
      clients.forEach(client => client.draw(ctx, cameraX, cameraY));
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
