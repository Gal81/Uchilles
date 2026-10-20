import type { Locale } from '../locales/index.ts';

type BuildingStyle = {
  x: number;
  width: number;
  height: number;
  color: string;
  roof: 'flat' | 'antenna' | 'steps' | 'waterTank' | 'peaked';
  sign?: 'diner' | 'hotel';
};

type CityLayer = {
  baseline: number;
  buildings: BuildingStyle[];
  windows: [string, string, string];
};

const CITY_LAYERS: CityLayer[] = [
  {
    baseline: 0,
    windows: ['#747b70', '#85867a', '#716f65'],
    buildings: [
      { x: 0.025, width: 0.06, height: 0.2, color: '#4e5d60', roof: 'flat' },
      { x: 0.105, width: 0.075, height: 0.27, color: '#536164', roof: 'steps' },
      { x: 0.215, width: 0.07, height: 0.19, color: '#49595d', roof: 'flat' },
      { x: 0.305, width: 0.05, height: 0.22, color: '#4b5a5e', roof: 'steps' },
      { x: 0.66, width: 0.07, height: 0.21, color: '#4d5c60', roof: 'flat' },
      { x: 0.765, width: 0.065, height: 0.25, color: '#536164', roof: 'waterTank' },
      { x: 0.87, width: 0.09, height: 0.2, color: '#4e5d60', roof: 'flat' },
    ],
  },
  {
    baseline: 2,
    windows: ['#a99e7e', '#c0b58e', '#536267'],
    buildings: [
      { x: 0.025, width: 0.095, height: 0.3, color: '#77817d', roof: 'flat' },
      { x: 0.145, width: 0.085, height: 0.36, color: '#857f73', roof: 'steps', sign: 'hotel' },
      { x: 0.255, width: 0.075, height: 0.25, color: '#716f69', roof: 'flat' },
      { x: 0.35, width: 0.085, height: 0.53, color: '#827d70', roof: 'peaked' },
      { x: 0.455, width: 0.085, height: 0.55, color: '#898374', roof: 'peaked' },
      { x: 0.58, width: 0.07, height: 0.31, color: '#777971', roof: 'antenna' },
      { x: 0.7, width: 0.09, height: 0.34, color: '#817b6e', roof: 'flat' },
      { x: 0.85, width: 0.12, height: 0.37, color: '#817c70', roof: 'flat', sign: 'diner' },
    ],
  },
  {
    baseline: 5,
    windows: ['#d0c29a', '#e1d2aa', '#646966'],
    buildings: [
      { x: 0.015, width: 0.075, height: 0.15, color: '#a19c89', roof: 'flat' },
      { x: 0.105, width: 0.085, height: 0.2, color: '#9a978b', roof: 'waterTank' },
      { x: 0.205, width: 0.065, height: 0.16, color: '#a7a18f', roof: 'flat' },
      { x: 0.75, width: 0.08, height: 0.17, color: '#969489', roof: 'waterTank' },
      { x: 0.85, width: 0.065, height: 0.14, color: '#a7a18f', roof: 'flat' },
      { x: 0.93, width: 0.07, height: 0.18, color: '#9a978b', roof: 'steps' },
    ],
  },
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
  baselineY: number,
  style: BuildingStyle,
  index: number,
  locale: Locale,
  windows: CityLayer['windows'],
) {
  const buildingHeight = style.height * baselineY * 0.95;
  const top = baselineY - buildingHeight;

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
    case 'peaked':
      ctx.beginPath();
      ctx.moveTo(x + width * 0.12, top);
      ctx.lineTo(x + width * 0.5, top - 10);
      ctx.lineTo(x + width * 0.88, top);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(x + width * 0.46, top - 13, width * 0.08, 3);
      ctx.strokeStyle = '#565f60';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + width * 0.08, top + 8);
      ctx.lineTo(x + width * 0.92, top + 8);
      ctx.moveTo(x + width * 0.08, top + 17);
      ctx.lineTo(x + width * 0.92, top + 17);
      ctx.stroke();
      break;
    case 'flat':
      ctx.fillRect(x, top - 2, width, 2);
      break;
  }

  const floors = Math.max(2, Math.floor(buildingHeight / 13));
  const windowsPerFloor = Math.max(2, Math.floor(width / 10));
  const windowWidth = Math.max(2, Math.min(4, width / (windowsPerFloor * 2.5)));
  const windowHeight = 3;

  for (let floor = 0; floor < floors; floor++) {
    const windowCount = windowsPerFloor - (floor % 3 === 0 ? 1 : 0);
    const windowGap = width / (windowCount + 1);
    const floorHeight = buildingHeight / (floors + 1);

    for (let window = 0; window < windowCount; window++) {
      const lit = ((floor * 7 + window * 3 + index * 5) % 5) !== 0;
      ctx.fillStyle = lit
        ? (floor + window + index) % 3 === 0 ? windows[0] : windows[1]
        : '#536267';
      ctx.fillRect(
        x + windowGap * (window + 1) - windowWidth / 2,
        top + 7 + floorHeight * floor,
        windowWidth,
        windowHeight,
      );
    }
  }

  if (style.sign) {
    drawNeonSign(ctx, x, top + buildingHeight * 0.55, width, style.sign, locale);
  }
}

function drawHorizonShrubs(
  ctx: CanvasRenderingContext2D,
  width: number,
  horizonY: number,
) {
  const clusters = [
    0.015, 0.065, 0.12, 0.24, 0.33, 0.39, 0.62, 0.68, 0.82, 0.94,
  ];

  clusters.forEach((position, i) => {
    const x = width * position;
    const shrubWidth = width * (0.025 + (i % 3) * 0.008);
    const shrubHeight = 5 + (i % 3) * 2;
    const baseY = horizonY + 1;

    ctx.fillStyle = i % 2 ? '#465b43' : '#526647';
    ctx.fillRect(x, baseY - shrubHeight + 2, shrubWidth, shrubHeight - 2);
    ctx.fillRect(x + shrubWidth * 0.18, baseY - shrubHeight, shrubWidth * 0.3, 4);
    ctx.fillRect(x + shrubWidth * 0.56, baseY - shrubHeight + 1, shrubWidth * 0.3, 4);
    ctx.fillStyle = '#718052';
    ctx.fillRect(x + shrubWidth * 0.22, baseY - shrubHeight + 3, 3, 2);
    ctx.fillRect(x + shrubWidth * 0.66, baseY - shrubHeight + 5, 3, 2);
  });
}

export function drawCity(
  ctx: CanvasRenderingContext2D,
  width: number,
  horizonY: number,
  locale: Locale,
) {
  CITY_LAYERS.forEach((layer) => {
    layer.buildings.forEach((style, index) => {
      drawBuilding(
        ctx,
        width * style.x,
        width * style.width,
        horizonY + layer.baseline,
        style,
        index,
        locale,
        layer.windows,
      );
    });
  });

  drawHorizonShrubs(ctx, width, horizonY);
}
