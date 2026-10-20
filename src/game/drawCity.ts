import type { Locale } from '../locales/index.ts';

type BuildingStyle = {
  width: number;
  height: number;
  color: string;
  roof: 'flat' | 'antenna' | 'steps' | 'waterTank';
  sign?: 'diner' | 'hotel';
};

const BUILDINGS: BuildingStyle[] = [
  { width: 0.105, height: 0.27, color: '#687d80', roof: 'flat' },
  { width: 0.078, height: 0.36, color: '#9b9b8d', roof: 'steps' },
  { width: 0.12, height: 0.31, color: '#74888a', roof: 'flat', sign: 'hotel' },
  { width: 0.08, height: 0.43, color: '#777f82', roof: 'antenna' },
  { width: 0.11, height: 0.34, color: '#a2a091', roof: 'waterTank' },
  { width: 0.09, height: 0.47, color: '#65797e', roof: 'steps' },
  { width: 0.12, height: 0.3, color: '#8d9088', roof: 'flat', sign: 'diner' },
  { width: 0.085, height: 0.4, color: '#718286', roof: 'antenna' },
  { width: 0.115, height: 0.33, color: '#9b9a8d', roof: 'flat' },
  { width: 0.095, height: 0.45, color: '#697d80', roof: 'waterTank' },
];

function drawNeonSign(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  kind: 'diner' | 'hotel',
  locale: Locale,
) {
  const signWidth = Math.min(width - 8, kind === 'diner' ? 43 : 38);
  const signHeight = 14;
  const signX = x + (width - signWidth) / 2;

  ctx.fillStyle = '#28343d';
  ctx.fillRect(signX - 2, y - 2, signWidth + 4, signHeight + 4);
  ctx.fillStyle = kind === 'diner' ? '#6e3345' : '#263d59';
  ctx.fillRect(signX, y, signWidth, signHeight);

  if (kind === 'diner') {
    ctx.fillStyle = '#ffc45e';
    ctx.fillRect(signX + 3, y + 3, 9, 2);
    ctx.fillStyle = '#f3e3b5';
    ctx.fillRect(signX + 4, y + 5, 7, 3);
    ctx.fillStyle = '#cc6147';
    ctx.fillRect(signX + 3, y + 8, 9, 2);
    ctx.font = 'bold 5px system-ui';
    ctx.fillStyle = '#ffb86b';
    ctx.textAlign = 'left';
    ctx.fillText(locale.dinerSign, signX + 14, y + 9);
  } else {
    ctx.font = 'bold 6px system-ui';
    ctx.fillStyle = '#71e6e0';
    ctx.textAlign = 'center';
    ctx.fillText(locale.hotelSign, signX + signWidth / 2, y + 9);
  }

  ctx.textAlign = 'start';
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  width: number,
  horizonY: number,
  style: BuildingStyle,
  index: number,
  locale: Locale,
) {
  const buildingHeight = style.height * horizonY * 1.8;
  const top = horizonY - buildingHeight;

  ctx.fillStyle = '#657477';
  ctx.fillRect(x + 2, top - 2, width + 2, buildingHeight + 2);
  ctx.fillStyle = style.color;
  ctx.fillRect(x, top, width, buildingHeight);

  const facade = ctx.createLinearGradient(x, top, x + width, top);
  facade.addColorStop(0, 'rgba(20, 35, 42, 0.16)');
  facade.addColorStop(0.55, 'rgba(255, 255, 255, 0.04)');
  facade.addColorStop(1, 'rgba(20, 35, 42, 0.22)');
  ctx.fillStyle = facade;
  ctx.fillRect(x, top, width, buildingHeight);

  ctx.fillStyle = '#565f60';
  switch (style.roof) {
    case 'steps':
      ctx.fillRect(x + width * 0.12, top - 5, width * 0.35, 5);
      ctx.fillRect(x + width * 0.48, top - 9, width * 0.38, 9);
      break;
    case 'antenna':
      ctx.fillRect(x + width * 0.48, top - 12, 2, 12);
      ctx.fillRect(x + width * 0.32, top - 9, width * 0.38, 2);
      break;
    case 'waterTank':
      ctx.fillRect(x + width * 0.2, top - 4, width * 0.6, 4);
      ctx.fillRect(x + width * 0.3, top - 9, width * 0.4, 5);
      ctx.fillRect(x + width * 0.35, top - 11, width * 0.3, 2);
      break;
    case 'flat':
      ctx.fillRect(x, top - 2, width, 2);
      break;
  }

  const columns = Math.max(2, Math.floor(width / 8));
  const rows = Math.max(2, Math.floor(buildingHeight / 11));
  const windowWidth = Math.max(2, Math.min(4, width / (columns * 2.4)));
  const windowHeight = 3;
  const columnGap = width / (columns + 1);
  const rowGap = (buildingHeight - 9) / (rows + 1);

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const lit = ((row * 7 + column * 3 + index * 5) % 6) !== 0;
      ctx.fillStyle = lit
        ? (row + column + index) % 3 === 0
          ? '#e5c995'
          : '#d7d0ad'
        : '#536267';
      ctx.fillRect(
        x + columnGap * (column + 0.5) - windowWidth / 2,
        top + 6 + rowGap * row,
        windowWidth,
        windowHeight,
      );
    }
  }

  if (style.sign) {
    drawNeonSign(ctx, x, top + buildingHeight * 0.55, width, style.sign, locale);
  }
}

export function drawCity(
  ctx: CanvasRenderingContext2D,
  width: number,
  horizonY: number,
  locale: Locale,
) {
  const farHeights = [0.26, 0.34, 0.3, 0.4, 0.32, 0.37, 0.28];
  const farColors = ['#879394', '#9e9d91', '#7e8d8e', '#a5a294'];
  const farWidth = width / farHeights.length;

  farHeights.forEach((height, index) => {
    const buildingHeight = horizonY * height;
    ctx.fillStyle = farColors[index % farColors.length];
    ctx.fillRect(
      index * farWidth,
      horizonY - buildingHeight,
      farWidth + 1,
      buildingHeight,
    );
    ctx.fillStyle = 'rgba(225, 214, 183, 0.65)';
    for (let row = 0; row < 3; row++) {
      ctx.fillRect(
        index * farWidth + 5,
        horizonY - buildingHeight + 9 + row * 11,
        3,
        4,
      );
    }
  });

  let x = 0;
  let index = 0;
  while (x < width) {
    const style = BUILDINGS[index % BUILDINGS.length];
    const buildingWidth = width * style.width;
    drawBuilding(ctx, x, buildingWidth, horizonY, style, index, locale);
    x += buildingWidth - 1;
    index++;
  }
}
