import type { Locale } from '../locales/index.ts';

type BuildingStyle = {
  x: number;
  width: number;
  height: number;
  color: string;
  roof: 'flat' | 'antenna' | 'steps' | 'waterTank' | 'peaked' | 'goldSpire';
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
    windows: ['#6e6470', '#796a72', '#685c68'],
    buildings: [
      { x: 0.015, width: 0.075, height: 0.23, color: '#493d54', roof: 'flat' },
      { x: 0.105, width: 0.075, height: 0.29, color: '#514252', roof: 'steps' },
      { x: 0.2, width: 0.085, height: 0.21, color: '#463d51', roof: 'flat' },
      { x: 0.3, width: 0.055, height: 0.24, color: '#4c4051', roof: 'steps' },
      { x: 0.65, width: 0.075, height: 0.23, color: '#493d54', roof: 'flat' },
      { x: 0.75, width: 0.07, height: 0.27, color: '#514252', roof: 'waterTank' },
      { x: 0.84, width: 0.075, height: 0.22, color: '#463d51', roof: 'flat' },
      { x: 0.93, width: 0.065, height: 0.25, color: '#4c4051', roof: 'steps' },
    ],
  },
  {
    baseline: 2,
    windows: ['#d0a66f', '#e2bd7d', '#66505a'],
    buildings: [
      { x: 0.015, width: 0.08, height: 0.31, color: '#9a6670', roof: 'flat' },
      { x: 0.11, width: 0.075, height: 0.37, color: '#a16c6c', roof: 'steps', sign: 'hotel' },
      { x: 0.19, width: 0.065, height: 0.27, color: '#825b68', roof: 'flat' },
      { x: 0.355, width: 0.13, height: 0.7, color: '#55485b', roof: 'goldSpire' },
      { x: 0.505, width: 0.13, height: 0.72, color: '#59485b', roof: 'goldSpire' },
      { x: 0.7, width: 0.055, height: 0.32, color: '#75545f', roof: 'antenna' },
      { x: 0.765, width: 0.065, height: 0.29, color: '#795965', roof: 'steps' },
      { x: 0.845, width: 0.065, height: 0.38, color: '#81606a', roof: 'flat' },
      { x: 0.92, width: 0.075, height: 0.32, color: '#9a6670', roof: 'flat', sign: 'diner' },
    ],
  },
  {
    baseline: 5,
    windows: ['#f0c077', '#f5d18d', '#79595e'],
    buildings: [
      { x: 0.015, width: 0.075, height: 0.15, color: '#b47a71', roof: 'flat' },
      { x: 0.1, width: 0.08, height: 0.2, color: '#aa746e', roof: 'waterTank' },
      { x: 0.19, width: 0.075, height: 0.16, color: '#c08470', roof: 'flat' },
      { x: 0.73, width: 0.075, height: 0.17, color: '#ad746e', roof: 'waterTank' },
      { x: 0.82, width: 0.08, height: 0.14, color: '#c08470', roof: 'flat' },
      { x: 0.91, width: 0.075, height: 0.18, color: '#b47a71', roof: 'steps' },
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

  if (style.roof === 'goldSpire') {
    drawTwinTower(ctx, x, width, baselineY, top, buildingHeight);
    return;
  }

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

function drawTwinTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  width: number,
  baselineY: number,
  top: number,
  height: number,
) {
  const tiers = [
    { bottom: 0.08, halfWidth: 0.25 },
    { bottom: 0.15, halfWidth: 0.34 },
    { bottom: 0.22, halfWidth: 0.41 },
    { bottom: 0.3, halfWidth: 0.48 },
    { bottom: 1, halfWidth: 0.48 },
  ];

  const centerX = x + width / 2;
  const towerTop = baselineY - height;

  tiers.forEach((tier, index) => {
    const previousBottom = index === 0 ? 0 : tiers[index - 1].bottom;
    const tierTop = towerTop + height * previousBottom;
    const tierBottom = towerTop + height * tier.bottom;
    const halfWidth = width * tier.halfWidth;
    const left = centerX - halfWidth;
    const tierWidth = halfWidth * 2;

    ctx.fillStyle = '#39424c';
    ctx.fillRect(left - 1, tierTop, tierWidth + 2, tierBottom - tierTop);
    ctx.fillStyle = '#788286';
    ctx.fillRect(left, tierTop, tierWidth, tierBottom - tierTop);
    ctx.fillStyle = '#657078';
    ctx.fillRect(left, tierTop, tierWidth * 0.1, tierBottom - tierTop);
    ctx.fillStyle = '#a2a6a3';
    ctx.fillRect(left + tierWidth * 0.91, tierTop, tierWidth * 0.08, tierBottom - tierTop);

    if (index > 0 && index < 4) {
      ctx.fillStyle = '#ded6c4';
      ctx.fillRect(left - 1, tierTop - 1, tierWidth + 2, 2);
      ctx.fillStyle = '#505963';
      ctx.fillRect(left - 1, tierTop + 1, tierWidth + 2, 1);
    }
  });

  const bandHeight = Math.max(3, height * 0.024);
  const bandGap = Math.max(3, height * 0.024);

  for (let progress = 0.31; progress < 0.98; progress += (bandHeight + bandGap) / height) {
    const tier = tiers.find((item) => progress < item.bottom) ?? tiers[tiers.length - 1];
    const halfWidth = width * tier.halfWidth;
    const bandY = towerTop + height * progress;
    const bandWidth = halfWidth * 2;
    const bandX = centerX - halfWidth;
    const bandIndex = Math.floor((progress - 0.31) * height / (bandHeight + bandGap));

    ctx.fillStyle = '#d7d0c1';
    ctx.fillRect(bandX, bandY, bandWidth, 2);
    ctx.fillStyle = bandIndex % 3 === 1 ? '#68747b' : '#394752';
    ctx.fillRect(bandX, bandY + 2, bandWidth, Math.max(1, bandHeight - 2));
    ctx.fillStyle = 'rgba(35, 43, 51, 0.28)';
    ctx.fillRect(bandX, bandY + bandHeight, bandWidth, 1);

    if (bandIndex % 3 === 0) {
      ctx.fillStyle = '#e4bb68';
      ctx.fillRect(bandX + bandWidth * 0.17, bandY + 2, 2, Math.max(1, bandHeight - 2));
      ctx.fillRect(bandX + bandWidth * 0.78, bandY + 2, 2, Math.max(1, bandHeight - 2));
    }
  }

  const mastX = x + width * 0.25;
  ctx.strokeStyle = '#373342';
  ctx.lineWidth = Math.max(1, width * 0.018);
  ctx.beginPath();
  ctx.moveTo(mastX, top + 2);
  ctx.lineTo(mastX - width * 0.025, top - height * 0.14);
  ctx.lineTo(mastX - width * 0.06, top + 2);
  ctx.moveTo(mastX - width * 0.045, top - height * 0.1);
  ctx.lineTo(mastX - width * 0.005, top - height * 0.1);
  ctx.moveTo(mastX - width * 0.05, top - height * 0.06);
  ctx.lineTo(mastX - width * 0.01, top - height * 0.06);
  ctx.stroke();

  ctx.fillStyle = '#e6a63e';
  ctx.beginPath();
  ctx.moveTo(centerX - width * 0.28, top + 1);
  ctx.lineTo(centerX, top - height * 0.12);
  ctx.lineTo(centerX + width * 0.28, top + 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd16c';
  ctx.beginPath();
  ctx.moveTo(centerX, top - height * 0.12);
  ctx.lineTo(centerX + width * 0.28, top + 1);
  ctx.lineTo(centerX, top + 1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#363746';
  ctx.fillRect(centerX - width * 0.29, top + 2, width * 0.58, Math.max(3, height * 0.035));
  ctx.fillStyle = '#e9c16c';
  ctx.fillRect(centerX - width * 0.29, top + height * 0.035, width * 0.58, Math.max(2, height * 0.018));
  ctx.fillStyle = '#d7c5a0';
  ctx.fillRect(centerX - width * 0.32, top + height * 0.055, width * 0.64, Math.max(2, height * 0.018));
  ctx.fillStyle = '#2d3040';
  ctx.fillRect(centerX - width * 0.32, top + height * 0.075, width * 0.64, Math.max(4, height * 0.035));
  ctx.fillStyle = '#dfc38f';
  ctx.fillRect(centerX - width * 0.39, top + height * 0.12, width * 0.78, Math.max(3, height * 0.025));
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
