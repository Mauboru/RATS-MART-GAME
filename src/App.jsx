import { GameCanvas } from './components/GameCanvas';

export default function App() {
  const assetPaths = {
    backgroundImg: './background.png',
    playerImg: './player.png',
    boxImg: './box.png',
    generatorImg: './generator.png',
    itemImg: './item.png',
    spotImage: './spot.png'
  };

  return <GameCanvas assetPaths={assetPaths} />;
}