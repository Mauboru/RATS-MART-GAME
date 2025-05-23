import { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';

export default function App() {
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [playerImg, setPlayerImg] = useState(null);

  useEffect(() => {
    const bg = new Image();
    bg.src = './background.png'; 
    bg.onload = () => setBackgroundImg(bg);

    const player = new Image();
    player.src = './player.png'; 
    player.onload = () => setPlayerImg(player);
  }, []);

  if (!backgroundImg || !playerImg) {
    return <div>Carregando imagens...</div>;
  }

  return (
    <GameCanvas backgroundImg={backgroundImg} playerImg={playerImg} />
  );
}
