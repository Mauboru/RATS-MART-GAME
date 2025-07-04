import { GameCanvas } from './components/GameCanvas';

export default function App() {
  const assetPaths = {
    backgroundImg: './background.png',
    playerImg01: './player.png',
    generatorImg: './generator.png',
    itemImg: './item.png',
    arvoreBananaImg: './arvoreBanana.png',
    bananaImg: './banana.png',
    spotImage: './spot.png',
    paymentBoxImage: './paymentBox.png',
    moneyImg: './sprites/UI/coin.png',
    clientImg: './client.png',
    cashierImg: './cashier.png',
    stockerImg: './stocker.png',
    garbageImg: './garbage.png',

    boxImg: './box.png',
    bananaBoxImg: './boxBanana.png',

    juiceMachineImg: './juiceMachine.png',
    sucoImg: './juice.png',

    // NOVOS SONS:
    backgroundMusic: './sounds/music.mp3',
    //pickupSound: './sounds/pickup.wav',

    upgradeIcon: './upgrade-icon.png',
    bagIcon: './bag-icon.png',

    // HUD ICONS OPTIONS
    upgradeButtonIcon: './sprites/UI/upgrade.png',
    configButtonIcon: './sprites/UI/tool.png',
    hatButtonIcon: './sprites/UI/hats.png',
    moneyIcon: './sprites/UI/coin.png',
    dailyButtonIcon: './sprites/UI/daily.png',
  };

  return <GameCanvas assetPaths={assetPaths} />;
}