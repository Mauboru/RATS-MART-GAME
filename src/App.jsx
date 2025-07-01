import { GameCanvas } from './components/GameCanvas';

export default function App() {
  const version = '1.0.3';

  const withVersion = (path) => `${path}?v=${version}`;

  const assetPaths = {
    backgroundImg: withVersion('./background.png'),
    playerImg01: withVersion('./player.png'),
    generatorImg: withVersion('./generator.png'),
    itemImg: withVersion('./queijo.png'),
    arvoreBananaImg: withVersion('./arvoreBanana.png'),
    bananaImg: withVersion('./banana.png'),
    spotImage: withVersion('./spot.png'),
    paymentBoxImage: withVersion('./paymentBox.png'),
    moneyImg: withVersion('./money.png'),
    clientImg: withVersion('./client.png'),
    cashierImg: withVersion('./cashier.png'),
    stockerImg: withVersion('./stocker.png'),
    configButtonIcon: withVersion('./engrenagem.png'),
    hatButtonIcon: withVersion('./hat.png'),
    upgradeButtonIcon: withVersion('./upgrade.png'),
    dailyButtonIcon: withVersion('./daily.png'),
    garbageImg: withVersion('./garbage.png'),

    boxImg: withVersion('./box.png'),
    bananaBoxImg: withVersion('./boxBanana.png'),

    backgroundMusic: withVersion('./sounds/music.mp3'),

    upgradeIcon: withVersion('./upgrade-icon.png'),
    bagIcon: withVersion('./bag-icon.png'),
    moneyIcon: withVersion('./money-icon.png'),
  };

  return <GameCanvas assetPaths={assetPaths} />;
}