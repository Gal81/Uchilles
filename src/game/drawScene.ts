import type { GameState } from './types.ts';
import { drawObstacle } from './drawObstacle.ts';
import { drawRunner } from './drawRunner.ts';
import { drawRoadside } from './drawRoadside.ts';
import {
  getRoadDepth,
  getRoadHalfWidth,
  ROAD_FEATURE_SECTIONS,
} from './projection.ts';
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
  sky.addColorStop(0, '#39b8ee');
  sky.addColorStop(0.14, '#69c9ee');
  sky.addColorStop(0.27, '#a5dff0');
  sky.addColorStop(0.36, '#f1d4a9');
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
    for (let i = 0; i < ROAD_FEATURE_SECTIONS; i++) {
      const z = (i / ROAD_FEATURE_SECTIONS + game.roadOffset) % 1;
      const depth = getRoadDepth(z);
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

  [...game.pursuers, game.player]
    .sort((a, b) => a.z - b.z)
    .forEach((runner) => drawRunner(ctx, runner, width, height));

  ctx.fillStyle = '#14242b';
  ctx.font = 'bold 23px system-ui';
  ctx.fillText(locale.gameTitle, 18, 38);

  ctx.font = '14px system-ui';
  ctx.fillText(locale.distance(Math.floor(game.distance)), 18, 61);

  const jumpBarX = 18;
  const jumpBarY = 78;
  const jumpBarWidth = 116;
  const jumpBarHeight = 9;
  ctx.font = 'bold 11px system-ui';
  ctx.fillStyle = '#14242b';
  ctx.fillText(locale.jumpLabel, jumpBarX, jumpBarY + 24);
  ctx.fillStyle = 'rgba(20, 36, 43, 0.55)';
  ctx.fillRect(jumpBarX, jumpBarY, jumpBarWidth, jumpBarHeight);
  ctx.fillStyle = game.player.jumpCharge >= 1 ? '#60c96b' : '#e5b84d';
  ctx.fillRect(
    jumpBarX + 1,
    jumpBarY + 1,
    (jumpBarWidth - 2) * game.player.jumpCharge,
    jumpBarHeight - 2,
  );
  ctx.strokeStyle = '#14242b';
  ctx.lineWidth = 1;
  ctx.strokeRect(jumpBarX, jumpBarY, jumpBarWidth, jumpBarHeight);

  if (game.status === 'over') {
    ctx.fillStyle = 'rgba(13, 24, 31, 0.76)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px system-ui';
    ctx.fillText(locale.gameOver, centerX, height * 0.43);

    ctx.font = '17px system-ui';
    const detailsY = height * 0.43 + 35;
    if (game.endReason === 'caught') {
      const bannerWidth = Math.min(
        width - 24,
        ctx.measureText(locale.caughtMessage).width + 32,
      );
      ctx.fillStyle = '#c62828';
      ctx.fillRect(centerX - bannerWidth / 2, detailsY - 22, bannerWidth, 34);
      ctx.fillStyle = '#fff';
      ctx.fillText(locale.caughtMessage, centerX, detailsY);
    }
    ctx.fillText(
      locale.distance(Math.floor(game.distance)),
      centerX,
      detailsY + (game.endReason === 'caught' ? 30 : 0),
    );
    ctx.fillText(
      locale.restartHint,
      centerX,
      detailsY + (game.endReason === 'caught' ? 67 : 37),
    );
    ctx.textAlign = 'start';
  }
}