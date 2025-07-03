const dollarIcon = new Image();
dollarIcon.src = '/sprites/UI/coin.png';

const gemIcon = new Image();
gemIcon.src = '/sprites/UI/gem.png';

export function drawMoneyHud(ctx, money, gems, canvasWidth) {
  const padding = 30;
  const iconSize = 40;
  const fontSize = 16;

  const startX = canvasWidth - padding - 130;
  const startY = padding + fontSize;

  ctx.fillStyle = 'white';
  ctx.font = `${fontSize}px Arial`;

  ctx.drawImage(dollarIcon, startX, startY - iconSize + 4, iconSize, iconSize);
  ctx.fillText(`${money}`, startX + iconSize + 15, startY - 6);

  ctx.drawImage(gemIcon, startX + iconSize + 50, startY - iconSize + 4, iconSize, iconSize);
  ctx.fillText(`${gems}`, startX + iconSize * 2 + 60, startY - 6);
}

export function drawActionButton(ctx, icon, x, y, size) {
    ctx.drawImage(icon, x, y, size, size);
}
  