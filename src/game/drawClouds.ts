type Cloud = {
  position: number;
  height: number;
  size: number;
  speed: number;
  opacity: number;
};

const CLOUDS: Cloud[] = [
  { position: 0.08, height: 0.1, size: 0.9, speed: 0.0012, opacity: 0.66 },
  { position: 0.43, height: 0.19, size: 0.68, speed: 0.0008, opacity: 0.52 },
  { position: 0.76, height: 0.075, size: 0.75, speed: 0.001, opacity: 0.6 },
  { position: 1.08, height: 0.16, size: 0.58, speed: 0.0007, opacity: 0.48 },
];

const CLOUD_SHAPES: Array<Array<[number, number]>> = [
  [
    [8, 14], [6, 19], [3, 23], [1, 26], [0, 28],
    [2, 26], [5, 23], [9, 19], [14, 16],
  ],
  [
    [3, 10], [2, 15], [0, 20], [1, 24], [4, 27],
    [8, 28], [12, 25], [16, 21], [20, 17],
  ],
  [
    [12, 18], [8, 22], [5, 25], [2, 28], [0, 29],
    [3, 27], [7, 24], [12, 20], [18, 16],
  ],
  [
    [5, 11], [3, 16], [1, 21], [0, 25], [2, 28],
    [6, 27], [10, 23], [15, 20], [19, 16],
  ],
];

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity: number,
  variant: number,
) {
  const unit = size * 1.25;
  const rows = CLOUD_SHAPES[variant % CLOUD_SHAPES.length];
  const top = y - unit * 6;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#bfd4df';
  rows.forEach(([start, end], row) => {
    const shadeWidth = Math.max(2, Math.floor((end - start) * 0.38));
    ctx.fillRect(
      x + start * unit,
      top + row * unit,
      (end - start) * unit,
      unit,
    );
    ctx.fillStyle = '#dce8e6';
    ctx.fillRect(
      x + (start + 1) * unit,
      top + row * unit,
      Math.max(0, end - start - shadeWidth - 1) * unit,
      unit,
    );
    ctx.fillStyle = '#bfd4df';
  });

  const highlightBands = [
    [4, 5, 5],
    [13, 1, 4],
    [21, 3, 3],
  ];
  ctx.fillStyle = '#f4f0dc';
  for (const [offset, row, length] of highlightBands) {
    ctx.fillRect(x + offset * unit, top + row * unit, length * unit, unit);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + unit * (variant + 3), top + unit, unit * 3, unit);
  ctx.restore();
}

export function drawClouds(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  distance: number,
) {
  CLOUDS.forEach((cloud, index) => {
    const size = width * 0.01 * cloud.size;
    const cloudWidth = size * 1.25 * 29;
    const travel = (cloud.position + distance * cloud.speed) % 1.35;
    const x = (travel - 0.2) * width;
    const y = height * cloud.height;

    if (x + cloudWidth < 0 || x > width) return;
    drawCloud(ctx, x, y, size, cloud.opacity, index);
  });
}
