import {
  getRoadDepth,
  getRoadHalfWidth,
  ROAD_FEATURE_SECTIONS,
} from './projection.ts';

type Side = -1 | 1;
type RoadsideObject = 'tree' | 'bush' | 'stop';

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

function roadsidePoint(
  width: number,
  height: number,
  side: Side,
  depth: number,
  extra: number,
) {
  return {
    x: width / 2 + side * (getRoadHalfWidth(width, depth) + extra),
    y: height * 0.29 + (height * 0.71) * depth,
  };
}

function drawGroundAndShoulders(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const horizonY = height * 0.29;
  const topDepth = 0;
  const bottomDepth = 1;
  const topRoad = getRoadHalfWidth(width, topDepth);
  const bottomRoad = getRoadHalfWidth(width, bottomDepth);
  const topShoulder = width * 0.014;
  const bottomShoulder = width * 0.035;
  const topSidewalk = width * 0.028;
  const bottomSidewalk = width * 0.075;
  const centerX = width / 2;

  for (const side of [-1, 1] as const) {
    fillPolygon(
      ctx,
      [
        [side < 0 ? 0 : width, horizonY],
        [centerX + side * (topRoad + topShoulder + topSidewalk), horizonY],
        [
          centerX + side * (bottomRoad + bottomShoulder + bottomSidewalk),
          height,
        ],
        [side < 0 ? 0 : width, height],
      ],
      '#82906a',
    );

    fillPolygon(
      ctx,
      [
        [centerX + side * (topRoad + topShoulder), horizonY],
        [centerX + side * (topRoad + topShoulder + topSidewalk), horizonY],
        [
          centerX + side * (bottomRoad + bottomShoulder + bottomSidewalk),
          height,
        ],
        [centerX + side * (bottomRoad + bottomShoulder), height],
      ],
      '#aaa997',
    );

    fillPolygon(
      ctx,
      [
        [centerX + side * topRoad, horizonY],
        [centerX + side * (topRoad + topShoulder), horizonY],
        [centerX + side * (bottomRoad + bottomShoulder), height],
        [centerX + side * bottomRoad, height],
      ],
      '#d0c4a5',
    );
  }
}

function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#5c4934';
  ctx.fillRect(-3, -24, 6, 24);
  ctx.fillStyle = '#413f2d';
  ctx.fillRect(-5, -14, 3, 14);

  ctx.fillStyle = '#435943';
  ctx.fillRect(-13, -43, 26, 17);
  ctx.fillRect(-10, -51, 20, 15);
  ctx.fillStyle = '#61754d';
  ctx.fillRect(-9, -47, 8, 8);
  ctx.fillRect(3, -43, 7, 7);
  ctx.fillStyle = '#354b3d';
  ctx.fillRect(-6, -37, 9, 9);
  ctx.fillRect(7, -39, 5, 7);

  ctx.restore();
}

function drawBush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = variant ? '#465b41' : '#536746';
  ctx.fillRect(-12, -10, 24, 10);
  ctx.fillRect(-9, -15, 8, 7);
  ctx.fillRect(1, -17, 9, 8);
  ctx.fillStyle = '#758054';
  ctx.fillRect(-6, -12, 5, 4);
  ctx.fillRect(4, -14, 4, 4);
  ctx.fillStyle = '#3d5541';
  ctx.fillRect(-12, -7, 7, 5);

  ctx.restore();
}

function drawBusStop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  side: Side,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = 'rgba(35, 42, 39, 0.2)';
  ctx.fillRect(-20, -2, 42, 3);

  ctx.fillStyle = '#3e514c';
  ctx.fillRect(-17, -34, 3, 34);
  ctx.fillRect(15, -34, 3, 34);
  ctx.fillRect(-17, -34, 35, 3);
  ctx.fillRect(-16, -31, 32, 15);

  ctx.fillStyle = '#b9d0c4';
  ctx.fillRect(-13, -29, 10, 11);
  ctx.fillStyle = '#91afa4';
  ctx.fillRect(0, -29, 12, 11);
  ctx.fillStyle = '#45544b';
  ctx.fillRect(-12, -13, 26, 3);
  ctx.fillStyle = '#7d5036';
  ctx.fillRect(-11, -16, 24, 3);
  ctx.fillStyle = '#3e514c';
  ctx.fillRect(-9, -13, 2, 5);
  ctx.fillRect(8, -13, 2, 5);

  ctx.fillStyle = '#e4d9b7';
  ctx.fillRect(side < 0 ? 20 : -24, -38, 4, 15);
  ctx.fillStyle = '#52705d';
  ctx.fillRect(side < 0 ? 21 : -23, -36, 2, 5);
  ctx.fillStyle = '#d1a25c';
  ctx.fillRect(side < 0 ? 21 : -23, -29, 2, 2);

  ctx.restore();
}

export function drawRoadside(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  roadOffset: number,
) {
  drawGroundAndShoulders(ctx, width, height);

  const objects: Array<{
    side: Side;
    z: number;
    kind: RoadsideObject;
    index: number;
  }> = [];

  for (const side of [-1, 1] as const) {
    for (let i = 0; i < ROAD_FEATURE_SECTIONS; i++) {
      const z = (i / ROAD_FEATURE_SECTIONS + roadOffset) % 1;
      const index = i + (side === 1 ? 2 : 0);
      const kinds: RoadsideObject[] = [
        'tree',
        'bush',
        'bush',
        'tree',
        'stop',
        'bush',
        'tree',
        'bush',
      ];
      objects.push({ side, z, kind: kinds[index % kinds.length], index });
    }
  }

  objects
    .sort((a, b) => a.z - b.z)
    .forEach(({ side, z, kind, index }) => {
      const depth = getRoadDepth(z);
      const point = roadsidePoint(
        width,
        height,
        side,
        depth,
        width * (0.04 + depth * 0.075),
      );

      switch (kind) {
        case 'tree':
          drawTree(ctx, point.x, point.y, 0.4 + z * 1.5);
          break;
        case 'bush':
          drawBush(ctx, point.x, point.y, 0.48 + z * 1.7, index % 2);
          break;
        case 'stop':
          drawBusStop(ctx, point.x, point.y, 0.28 + z * 1.28, side);
          break;
      }
    });
}
