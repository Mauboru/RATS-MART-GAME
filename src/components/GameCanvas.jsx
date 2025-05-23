import { useRef, useEffect } from 'react';
import { useJoystick } from '../hooks/useJoystick';
import { JoystickOverlay } from '../components/JoystickOverlay';

export function GameCanvas({ backgroundImg, playerImg }) {
  const canvasRef = useRef(null);
  const playerRef = useRef({ x: 100, y: 100, speed: 3 });

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
    const PLAYER_SIZE = 64;

    let animationFrameId;

    const loop = () => {
      let { x, y, speed } = playerRef.current;

      const viewportWidth = canvas.width / (window.devicePixelRatio || 1);
      const viewportHeight = canvas.height / (window.devicePixelRatio || 1);

      if (activeRef.current) {
        x += directionRef.current.x * speed;
        y += directionRef.current.y * speed;
      }

      // Limitar posição do player dentro do mundo
      x = Math.max(0, Math.min(x, WORLD_SIZE - PLAYER_SIZE));
      y = Math.max(0, Math.min(y, WORLD_SIZE - PLAYER_SIZE));

      playerRef.current = { x, y, speed };

      // Câmera centralizada no player
      let cameraX = x + PLAYER_SIZE / 2 - viewportWidth / 2;
      let cameraY = y + PLAYER_SIZE / 2 - viewportHeight / 2;

      // Limitar câmera para não mostrar área fora do mundo
      cameraX = Math.max(0, Math.min(cameraX, WORLD_SIZE - viewportWidth));
      cameraY = Math.max(0, Math.min(cameraY, WORLD_SIZE - viewportHeight));

      ctx.clearRect(0, 0, viewportWidth, viewportHeight);

      // Desenhar fundo recortado pela câmera
      ctx.drawImage(
        backgroundImg,
        cameraX, cameraY,            // origem (crop) no background
        viewportWidth, viewportHeight, // largura e altura do crop
        0, 0,                        // destino no canvas
        viewportWidth, viewportHeight // largura e altura no canvas
      );

      // Desenhar player na posição relativa à câmera
      const playerDrawX = x - cameraX;
      const playerDrawY = y - cameraY;

      ctx.drawImage(playerImg, playerDrawX, playerDrawY, PLAYER_SIZE, PLAYER_SIZE);

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
