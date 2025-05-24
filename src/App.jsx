import { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';

export default function App() {
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [playerImg, setPlayerImg] = useState(null);
  const [boxImg, setBoxImg] = useState(null);
  const [generatorImg, setGeneratorImg] = useState(null);
  const [itemImg, setItemImg] = useState(null);

  useEffect(() => {
    const bg = new Image();
    bg.src = './background.png';
    bg.onload = () => setBackgroundImg(bg);
  
    const player = new Image();
    player.src = './player.png';
    player.onload = () => setPlayerImg(player);
  
    const box = new Image();
    box.src = './box.png';
    box.onload = () => setBoxImg(box);
  
    const generator = new Image();
    generator.src = './generator.png';
    generator.onload = () => setGeneratorImg(generator);
  
    const item = new Image();
    item.src = './item.png';
    item.onload = () => setItemImg(item);
  }, []);

  if (!backgroundImg || !playerImg || !boxImg || !generatorImg || !itemImg) {
    return <div>Carregando imagens...</div>;
  }

  return (
    <GameCanvas
      backgroundImg={backgroundImg}
      playerImg={playerImg}
      boxImg={boxImg}
      generatorImg={generatorImg}
      itemImg={itemImg}
    />
  );
}
