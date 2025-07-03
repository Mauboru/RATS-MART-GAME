import { GameCanvas } from './components/GameCanvas';

export default function App() {
  const assetPaths = {
    backgroundImg: './background.png',
    playerImg01: './player.png',
    generatorImg: './generator.png',
    itemImg: './queijo.png',
    arvoreBananaImg: './arvoreBanana.png',
    bananaImg: './banana.png',
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

    boxImg: './box.png',
    bananaBoxImg: './boxBanana.png',

    juiceMachineImg: './paymentBox.png',
    sucoImg: './hat.png',

    // NOVOS SONS:
    backgroundMusic: './sounds/music.mp3',
    //pickupSound: './sounds/pickup.wav',

    // ... outros assets
    upgradeIcon: './upgrade-icon.png',
    bagIcon: './bag-icon.png',        
    moneyIcon: './money-icon.png',
  };

  return <GameCanvas assetPaths={assetPaths} />;
}