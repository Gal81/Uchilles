import type { Obstacle } from './entities/obstacle.ts';
import { projectLanePosition } from './projection.ts';

type VehicleObstacle = Exclude<Obstacle, { kind: 'barrier' }>;
type Point = [number, number];

function assertNever(value: never): never {
  throw new Error(`Unsupported obstacle: ${JSON.stringify(value)}`);
}

function fillShape(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.closePath();
  ctx.fill();
}

function drawMotorcycle(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = '#20282c';
  ctx.fillRect(-5, -11, 10, 11);
  ctx.fillStyle = '#737b79';
  ctx.fillRect(-2, -10, 4, 8);

  ctx.strokeStyle = '#414b4d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-3, -10);
  ctx.lineTo(-8, -31);
  ctx.lineTo(-15, -34);
  ctx.moveTo(3, -10);
  ctx.lineTo(8, -31);
  ctx.lineTo(15, -34);
  ctx.stroke();

  ctx.fillStyle = '#252d30';
  ctx.fillRect(-18, -36, 7, 3);
  ctx.fillRect(11, -36, 7, 3);
  ctx.fillStyle = '#aaa58e';
  ctx.fillRect(-17, -39, 3, 4);
  ctx.fillRect(14, -39, 3, 4);

  fillShape(
    ctx,
    [
      [-8, -27],
      [-6, -34],
      [0, -38],
      [6, -34],
      [8, -27],
      [5, -19],
      [-5, -19],
    ],
    color,
  );

  ctx.fillStyle = '#28383d';
  ctx.fillRect(-5, -34, 10, 8);
  ctx.fillStyle = '#a9c5c5';
  ctx.fillRect(-3, -32, 6, 4);
  ctx.fillStyle = '#fff0a6';
  ctx.fillRect(-4, -23, 8, 5);
  ctx.fillStyle = '#c9483c';
  ctx.fillRect(-3, -19, 6, 2);

  ctx.fillStyle = '#30383a';
  ctx.beginPath();
  ctx.arc(0, -43, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d9d2bd';
  ctx.fillRect(-4, -45, 8, 3);

  /* Rider silhouette keeps the motorcycle readable at a distance. */
  ctx.fillStyle = '#20282c';
  ctx.fillRect(-3, -50, 6, 5);
}

function drawCarBody(
  ctx: CanvasRenderingContext2D,
  obstacle: VehicleObstacle,
) {
  const isCompact = obstacle.kind === 'compact';
  const width = isCompact ? 38 : 46;
  const height = isCompact ? 34 : 43;
  const halfWidth = width / 2;
  const roofY = -height;
  const windscreenY = -height * 0.56;

  fillShape(
    ctx,
    [
      [-halfWidth * 0.76, 0],
      [halfWidth * 0.76, 0],
      [halfWidth, -7],
      [halfWidth * 0.88, roofY + 5],
      [halfWidth * 0.62, roofY],
      [-halfWidth * 0.62, roofY],
      [-halfWidth * 0.88, roofY + 5],
      [-halfWidth, -7],
    ],
    obstacle.color,
  );

  ctx.fillStyle = '#222a2d';
  ctx.fillRect(-halfWidth - 2, -15, 5, 13);
  ctx.fillRect(halfWidth - 3, -15, 5, 13);
  ctx.fillStyle = '#555d5e';
  ctx.fillRect(-halfWidth - 1, -13, 3, 8);
  ctx.fillRect(halfWidth - 2, -13, 3, 8);

  fillShape(
    ctx,
    [
      [-halfWidth * 0.64, roofY + 3],
      [halfWidth * 0.64, roofY + 3],
      [halfWidth * 0.78, windscreenY],
      [-halfWidth * 0.78, windscreenY],
    ],
    '#26383d',
  );
  fillShape(
    ctx,
    [
      [-halfWidth * 0.55, roofY + 5],
      [halfWidth * 0.55, roofY + 5],
      [halfWidth * 0.7, windscreenY - 2],
      [-halfWidth * 0.7, windscreenY - 2],
    ],
    '#9bbdc1',
  );
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(-halfWidth * 0.48, roofY + 7, 3, windscreenY - roofY - 10);

  ctx.fillStyle = '#d6d0bd';
  ctx.fillRect(-halfWidth * 0.76, windscreenY + 2, halfWidth * 1.52, 2);
  ctx.fillStyle = obstacle.color;
  ctx.fillRect(-halfWidth * 0.72, windscreenY + 4, halfWidth * 1.44, 2);

  ctx.fillStyle = 'rgba(35, 40, 38, 0.18)';
  ctx.fillRect(-halfWidth * 0.68, -15, halfWidth * 1.36, 2);
  ctx.strokeStyle = 'rgba(47, 53, 50, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, windscreenY + 7);
  ctx.lineTo(0, -15);
  ctx.stroke();

  ctx.fillStyle = '#303a3d';
  ctx.fillRect(-halfWidth * 0.48, -11, halfWidth * 0.96, 7);
  ctx.fillStyle = '#8e9892';
  ctx.fillRect(-halfWidth * 0.33, -9, halfWidth * 0.66, 3);
  ctx.fillStyle = '#fff0a6';
  ctx.fillRect(-halfWidth * 0.86, -12, halfWidth * 0.3, 6);
  ctx.fillRect(halfWidth * 0.56, -12, halfWidth * 0.3, 6);
  ctx.fillStyle = '#fff8d4';
  ctx.fillRect(-halfWidth * 0.78, -11, 4, 2);
  ctx.fillRect(halfWidth * 0.64, -11, 4, 2);

  ctx.fillStyle = '#30383a';
  ctx.fillRect(-halfWidth * 0.68, -3, halfWidth * 1.36, 3);
  ctx.fillStyle = '#555d5e';
  ctx.fillRect(-halfWidth * 0.54, -2, halfWidth * 1.08, 1);
}

function drawLargeVehicle(
  ctx: CanvasRenderingContext2D,
  obstacle: VehicleObstacle,
) {
  const isBus = obstacle.kind === 'bus';
  const width = isBus ? 58 : 54;
  const height = isBus ? 66 : 58;
  const halfWidth = width / 2;
  const roofY = -height;
  const windshieldY = isBus ? -height * 0.54 : -height * 0.48;

  fillShape(
    ctx,
    [
      [-halfWidth * 0.82, 0],
      [halfWidth * 0.82, 0],
      [halfWidth, -7],
      [halfWidth, roofY + 6],
      [halfWidth * 0.92, roofY],
      [-halfWidth * 0.92, roofY],
      [-halfWidth, roofY + 6],
      [-halfWidth, -7],
    ],
    obstacle.color,
  );

  ctx.fillStyle = '#222a2d';
  ctx.fillRect(-halfWidth - 4, -24, 7, 15);
  ctx.fillRect(halfWidth - 3, -24, 7, 15);
  ctx.fillStyle = '#555d5e';
  ctx.fillRect(-halfWidth - 2, -21, 4, 9);
  ctx.fillRect(halfWidth - 2, -21, 4, 9);

  if (isBus) {
    ctx.fillStyle = '#26383d';
    ctx.fillRect(-halfWidth * 0.74, roofY + 4, halfWidth * 1.48, 7);
    ctx.fillStyle = '#f0d58b';
    ctx.fillRect(-halfWidth * 0.6, roofY + 6, halfWidth * 1.2, 2);
    fillShape(
      ctx,
      [
        [-halfWidth * 0.78, roofY + 13],
        [halfWidth * 0.78, roofY + 13],
        [halfWidth * 0.82, windshieldY],
        [-halfWidth * 0.82, windshieldY],
      ],
      '#26383d',
    );
    fillShape(
      ctx,
      [
        [-halfWidth * 0.7, roofY + 15],
        [halfWidth * 0.7, roofY + 15],
        [halfWidth * 0.72, windshieldY - 2],
        [-halfWidth * 0.72, windshieldY - 2],
      ],
      '#a2c0c2',
    );
  } else {
    fillShape(
      ctx,
      [
        [-halfWidth * 0.74, roofY + 5],
        [halfWidth * 0.74, roofY + 5],
        [halfWidth * 0.84, windshieldY],
        [-halfWidth * 0.84, windshieldY],
      ],
      '#26383d',
    );
    fillShape(
      ctx,
      [
        [-halfWidth * 0.64, roofY + 8],
        [halfWidth * 0.64, roofY + 8],
        [halfWidth * 0.73, windshieldY - 2],
        [-halfWidth * 0.73, windshieldY - 2],
      ],
      '#9bbdc1',
    );
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.36)';
  ctx.fillRect(-halfWidth * 0.43, roofY + 10, 3, windshieldY - roofY - 14);

  ctx.fillStyle = obstacle.color;
  ctx.fillRect(-halfWidth * 0.88, windshieldY + 2, halfWidth * 1.76, 5);
  ctx.fillStyle = 'rgba(35, 40, 38, 0.18)';
  ctx.fillRect(-halfWidth * 0.82, -18, halfWidth * 1.64, 2);
  ctx.fillStyle = '#fff0a6';
  ctx.fillRect(-halfWidth * 0.82, -14, 9, 7);
  ctx.fillRect(halfWidth * 0.54, -14, 9, 7);
  ctx.fillStyle = '#fff8d4';
  ctx.fillRect(-halfWidth * 0.78, -13, 5, 3);
  ctx.fillRect(halfWidth * 0.63, -13, 5, 3);
  ctx.fillStyle = '#303a3d';
  ctx.fillRect(-halfWidth * 0.36, -14, halfWidth * 0.72, 8);
  ctx.fillStyle = '#737b78';
  ctx.fillRect(-halfWidth * 0.26, -12, halfWidth * 0.52, 2);
  ctx.fillStyle = '#bbc2b8';
  ctx.fillRect(-5, -11, 10, 2);
  ctx.fillStyle = '#20282c';
  ctx.fillRect(-halfWidth * 0.78, -3, halfWidth * 1.56, 3);
}

function drawVehicle(ctx: CanvasRenderingContext2D, obstacle: VehicleObstacle) {
  switch (obstacle.kind) {
    case 'motorcycle':
      drawMotorcycle(ctx, obstacle.color);
      break;
    case 'compact':
    case 'sedan':
      drawCarBody(ctx, obstacle);
      break;
    case 'truck':
    case 'bus':
      drawLargeVehicle(ctx, obstacle);
      break;
  }
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
    case 'motorcycle':
    case 'compact':
    case 'sedan':
    case 'truck':
    case 'bus':
      drawVehicle(ctx, obstacle);
      break;
    default:
      assertNever(obstacle);
  }

  ctx.restore();
}
