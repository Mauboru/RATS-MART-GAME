import { useRef, useEffect } from 'react';
import { useJoystick } from '../hooks/useJoystick';
import { JoystickOverlay } from '../components/JoystickOverlay';
import { Player } from '../models/Player';

export function GameCanvas({ backgroundImg, playerImg }) {
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

    let animationFrameId;

    const loop = () => {
      const player = playerRef.current;

      if (activeRef.current) {
        player.update(directionRef.current);
      } else {
        player.update({ x: 0, y: 0 });
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

      player.draw(ctx, cameraX, cameraY);

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
