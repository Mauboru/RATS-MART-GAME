import { GameCanvas } from './components/GameCanvas';

export default function App() {
  const assetPaths = {
    backgroundImg: './background.png',
    playerImg: './player.png',
    boxImg: './box.png',
    generatorImg: './generator.png',
    itemImg: './item.png',
    spotImage: './spot.png',
    paymentBoxImage: './paymentBox.png',
    moneyImg: './money.png',
    clientImg: './client.png',
    cashierImg: './cashier.png',
    stockerImg: './stocker.png',
    configButtonIcon: './engrenagem.png',
    hatButtonIcon: './hat.png',
    upgradeButtonIcon: './upgrade.png',
    dailyButtonIcon: './daily.png',
    garbageImg: './garbage.png',

    // NOVOS SONS:
    backgroundMusic: './sounds/music.mp3',
    //pickupSound: './sounds/pickup.wav',
  };

  return <GameCanvas assetPaths={assetPaths} />;
}