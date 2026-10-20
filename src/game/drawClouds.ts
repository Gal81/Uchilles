type Cloud = {
  position: number;
  height: number;
  size: number;
  speed: number;
};

const CLOUDS: Cloud[] = [
  { position: 0.08, height: 0.1, size: 0.9, speed: 0.0012 },
  { position: 0.43, height: 0.19, size: 0.68, speed: 0.0008 },
  { position: 0.76, height: 0.075, size: 0.75, speed: 0.001 },
  { position: 1.08, height: 0.16, size: 0.58, speed: 0.0007 },
];

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const unit = size * 8;

  ctx.fillStyle = 'rgba(237, 239, 222, 0.72)';
  ctx.fillRect(x, y, unit * 7, unit * 1.4);
  ctx.fillRect(x + unit, y - unit, unit * 2, unit * 2);
  ctx.fillRect(x + unit * 2.5, y - unit * 1.8, unit * 2.5, unit * 2.8);
  ctx.fillRect(x + unit * 4.5, y - unit * 0.8, unit * 1.7, unit * 1.8);

  ctx.fillStyle = 'rgba(255, 255, 240, 0.45)';
  ctx.fillRect(x + unit, y - unit * 0.7, unit * 1.6, unit * 0.5);
  ctx.fillRect(x + unit * 2.8, y - unit * 1.5, unit * 1.7, unit * 0.5);
  ctx.fillRect(x + unit * 5, y - unit * 0.5, unit, unit * 0.4);
}

export function drawClouds(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  distance: number,
) {
  for (const cloud of CLOUDS) {
    const size = width * 0.006 * cloud.size;
    const cloudWidth = size * 8 * 7;
    const travel = (cloud.position + distance * cloud.speed) % 1.35;
    const x = (travel - 0.2) * width;
    const y = height * cloud.height;

    if (x + cloudWidth < 0 || x > width) continue;
    drawCloud(ctx, x, y, size);
  }
}
