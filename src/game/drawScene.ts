import type { GameState } from './types.ts';
import { drawObstacle } from './drawObstacle.ts';
import { drawRunner } from './drawRunner.ts';
import { drawRoadside } from './drawRoadside.ts';
import { getRoadHalfWidth } from './projection.ts';
import { drawCity } from './drawCity.ts';
import { drawClouds } from './drawClouds.ts';
import type { Locale } from '../locales/index.ts';

function fillPolygon(
  ctx: CanvasRenderingContext2D,
  points: Array<[number, number]>,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.closePath();
  ctx.fill();
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  game: GameState,
  width: number,
  height: number,
  locale: Locale,
) {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#8ab6c1');
  sky.addColorStop(1, '#e5d6b7');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const horizonY = height * 0.29;
  const centerX = width / 2;

  drawClouds(ctx, width, height, game.distance);
  drawCity(ctx, width, horizonY, locale);

  drawRoadside(ctx, width, height, game.roadOffset);

  const roadTopHalfWidth = getRoadHalfWidth(width, 0);
  const roadBottomHalfWidth = getRoadHalfWidth(width, 1);

  fillPolygon(
    ctx,
    [
      [centerX - roadTopHalfWidth, horizonY],
      [centerX + roadTopHalfWidth, horizonY],
      [centerX + roadBottomHalfWidth, height],
      [centerX - roadBottomHalfWidth, height],
    ],
    '#4a5357',
  );

  ctx.strokeStyle = '#e7d7b5';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - roadTopHalfWidth, horizonY);
  ctx.lineTo(centerX - roadBottomHalfWidth, height);
  ctx.moveTo(centerX + roadTopHalfWidth, horizonY);
  ctx.lineTo(centerX + roadBottomHalfWidth, height);
  ctx.stroke();

  for (const divider of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const z = (i / 9 + game.roadOffset) % 1;
      const depth = z * z;
      const y = horizonY + (height - horizonY) * depth;
      const roadHalfWidth = getRoadHalfWidth(width, depth);
      const x = centerX + divider * roadHalfWidth * 0.31;
      const markerHeight = 3 + depth * 24;
      ctx.fillStyle = '#d7d4c8';
      ctx.fillRect(x - 1.5, y, 3, markerHeight);
    }
  }

  game.obstacles
    .slice()
    .sort((a, b) => a.z - b.z)
    .forEach((obstacle) => drawObstacle(ctx, obstacle, width, height));

  game.pursuers.forEach((pursuer) => {
    drawRunner(ctx, pursuer, width, height);
  });
  drawRunner(ctx, game.player, width, height);

  ctx.fillStyle = '#14242b';
  ctx.font = 'bold 23px system-ui';
  ctx.fillText(locale.gameTitle, 18, 38);

  ctx.font = '14px system-ui';
  ctx.fillText(locale.distance(Math.floor(game.distance)), 18, 61);

  if (game.status === 'over') {
    ctx.fillStyle = 'rgba(13, 24, 31, 0.76)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px system-ui';
    ctx.fillText(locale.gameOver, centerX, height * 0.43);

    ctx.font = '17px system-ui';
    ctx.fillText(
      locale.distance(Math.floor(game.distance)),
      centerX,
      height * 0.43 + 35,
    );
    ctx.fillText(
      locale.restartHint,
      centerX,
      height * 0.43 + 72,
    );
    ctx.textAlign = 'start';
  }
}