import { useRef, useEffect } from 'react';
import { useAssets } from '../hooks/useAssets';
import { useJoystick } from '../hooks/useJoystick';
import { JoystickOverlay } from '../components/JoystickOverlay';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { GameManager, Renderer } from '../models/';
import { load } from '../utils/saveGame';

export function GameCanvas({ assetPaths }) {
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const activeRef = useRef(null);
  const gameManagerRef = useRef(null);
  const rendererRef = useRef(null);
  const lastTransferTimeRef = useRef(0);
  
  const { assets, loaded } = useAssets(assetPaths);
  const { active, basePos, stickPos, directionRef, handlers, radius } = useJoystick(60);

  let lastTime = performance.now();

  // Verifica se o Joystick está ativo
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Configuração de fullscreen
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

  // Configuração de Audios e Sons
  useEffect(() => {
    const music = assets.backgroundMusic;
  
    const tryPlayMusic = () => {
      if (music && music.paused) {
        music.loop = true;
        // music.volume = 0.3;
        music.volume = 0;
        music.play().catch((err) => {
          console.warn('Erro ao tocar música:', err);
        });
      }
    };
  
    window.addEventListener('click', tryPlayMusic, { once: true });
    window.addEventListener('touchstart', tryPlayMusic, { once: true });
  
    return () => {
      window.removeEventListener('click', tryPlayMusic);
      window.removeEventListener('touchstart', tryPlayMusic);
    };
  }, [assets]);
  
  // Inicialização do jogo
  useEffect(() => {
    if (!loaded) return;

    // Monta os ícones usados pelos clientes
    assets.icons = {
      suco: assets.sucoImg,
      maca: assets.itemImg,
      banana: assets.bananaImg,
    };

    const music = assets.backgroundMusic;
    music.loop = true;
    music.volume = 0.3;
    music.play().catch(() => {
      console.warn('Interação do usuário necessária para iniciar o áudio.');
    });

    const canvas = canvasRef.current;
    const loadedData = load('GameSaved03');
    //localStorage.clear(); // remover isso depois

    const now = performance.now();
    const deltaTime = now - lastTime;
    lastTime = now;

    // Inicializa o gerenciador do jogo e o renderizador
    gameManagerRef.current = new GameManager(assets);
    gameManagerRef.current.initialize(loadedData);
    playerRef.current = gameManagerRef.current.player;

    rendererRef.current = new Renderer(canvas, assets, gameManagerRef.current.player);
    rendererRef.current.setupCanvas();

    // Configura o listener de clique
    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      rendererRef.current.checkButtonClick(clickX, clickY);
    };

    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', () => rendererRef.current.setupCanvas());

    // Configura o salvamento automático
    const saveInterval = setInterval(() => gameManagerRef.current.saveGame(), 60000);

    // Loop principal do jogo
    let animationFrameId;
    const loop = () => {
      const gameManager = gameManagerRef.current;
      const player = gameManager.player;
      const transferDelay = 300;

      // Atualiza o jogador
      if (activeRef.current) {
        const collisionObjects = [...gameManager.boxes, gameManager.paymentBox, ...gameManager.processingGenerators];
        player.update(directionRef.current, collisionObjects);
      } else {
        player.update({ x: 0, y: 0 }, []);
      }

      // Atualiza geradores
      gameManager.generators.forEach(generator => {
        generator.update();
        generator.generatedItems = generator.generatedItems.filter(item => {
          if (item.checkCollision(player) && player.getItem() < player.maxItems) {
            player.addItem(item);
            return false;
          }
          return true;
        });
      });

      // Atualiza geradores de suco
      gameManager.processingGenerators.forEach(processingGenerator => {
        if (processingGenerator.checkCollision(player)) {
          if (processingGenerator.isBroken) {
            processingGenerator.repair();
          }
      
          const playerCenterX = player.x + player.drawWidth / 2;
          const generatorCenterX = processingGenerator.x + processingGenerator.width / 2;
      
          const isLeftSide = playerCenterX < generatorCenterX;
          const isRightSide = playerCenterX >= generatorCenterX;
      
          // Entrega item (lado esquerdo)
          if (isLeftSide && player.getItem() > 0) {
            const lastItem = player.items[player.items.length - 1];
            if (processingGenerator.tryInsertItem(lastItem)) {
              player.items.pop();
            }
          }
      
          // Coleta saída (lado direito)
          if (isRightSide && processingGenerator.outputItems.length > 0 && player.items.length < player.maxItems) {
            const outputItem = processingGenerator.takeOutputItem();
            if (outputItem) player.addItem(outputItem);
          }
        }
        processingGenerator.update();
      });

      // Atualiza caixas
      gameManager.boxes.forEach(box => {
        if (box.checkCollision(player) && player.items.length > 0 && box.items.length < 9) {
          const now = performance.now();
      
          if (now - lastTransferTimeRef.current > transferDelay) {
            const transferableItems = player.items.filter(item => item.type === box.type);
      
            while (box.items.length < 9 && transferableItems.length > 0) {
              const item = transferableItems.shift();
      
              const index = player.items.indexOf(item);
              if (index !== -1) {
                player.items.splice(index, 1);
                box.addItem(item);
                lastTransferTimeRef.current = now;
              }
            }
          }
        }
      });

      gameManager.update();

      // Atualizando Lixeira
      gameManager.updateGarbage(deltaTime);

      // Calcula posição da câmera
      const viewportWidth = canvas.width / rendererRef.current.scale;
      const viewportHeight = canvas.height / rendererRef.current.scale;

      let cameraX = player.x + 32 - viewportWidth / 2;
      let cameraY = player.y + 32 - viewportHeight / 2;

      cameraX = Math.max(0, Math.min(cameraX, gameManager.worldSize - viewportWidth));
      cameraY = Math.max(0, Math.min(cameraY, gameManager.worldSize - viewportHeight));

      // Renderiza o jogo
      rendererRef.current.render(gameManager, cameraX, cameraY);

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    // Começa criar cliente
    gameManagerRef.current.startClientSpawning();

    // Limpeza
    return () => {
      clearInterval(saveInterval);
      gameManagerRef.current?.cleanup();
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', () => rendererRef.current?.setupCanvas());
    };
  }, [loaded, directionRef, assets]);

  return (
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
  );
}