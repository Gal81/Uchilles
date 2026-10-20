import type { Runner } from './entities/runner.ts';
import { projectLanePosition } from './projection.ts';
import { drawHero } from './drawHero.ts';
import { drawMilitaryPursuer } from './drawMilitaryPursuer.ts';

export function drawRunner(
  ctx: CanvasRenderingContext2D,
  runner: Runner,
  width: number,
  height: number,
) {
  const { x, y, scale } = projectLanePosition(
    width,
    height,
    runner.lane,
    runner.z,
  );

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (runner.role === 'player') {
    drawHero(ctx, runner.animationTime);
  } else {
    drawMilitaryPursuer(ctx, runner);
  }

  ctx.restore();
}
