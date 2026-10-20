import type { Obstacle } from './entities/obstacle.ts';
import { projectLanePosition } from './projection.ts';

function assertNever(value: never): never {
  throw new Error(`Unsupported obstacle: ${JSON.stringify(value)}`);
}

export function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  width: number,
  height: number,
) {
  const { x, y, scale } = projectLanePosition(
    width,
    height,
    obstacle.lane,
    obstacle.z,
  );

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  switch (obstacle.kind) {
    case 'barrier':
      ctx.fillStyle = '#e4d9c5';
      ctx.fillRect(-22, -27, 44, 27);
      ctx.fillStyle = '#d65343';
      ctx.fillRect(-22, -22, 44, 7);
      ctx.fillRect(-22, -7, 44, 7);
      break;
    case 'car':
      ctx.fillStyle = '#283b49';
      ctx.fillRect(-23, -43, 46, 43);
      ctx.fillStyle = '#9eb9bd';
      ctx.fillRect(-16, -36, 32, 12);
      ctx.fillStyle = '#e7b45b';
      ctx.fillRect(-18, -5, 8, 4);
      ctx.fillRect(10, -5, 8, 4);
      break;
    default:
      assertNever(obstacle);
  }

  ctx.restore();
}
