import type { Runner } from './entities/runner.ts';
import { projectLanePosition } from './projection.ts';

const PURSUER_COLORS = {
  standard: '#475a67',
} satisfies Record<Extract<Runner, { role: 'pursuer' }>['kind'], string>;

function getRunnerColor(runner: Runner) {
  return runner.role === 'player'
    ? '#d6a85c'
    : PURSUER_COLORS[runner.kind];
}

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
  const color = getRunnerColor(runner);
  const stride = Math.sin(runner.animationTime * 12) * 4;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';

  ctx.strokeStyle = '#202833';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-5, -19);
  ctx.lineTo(-10, stride);
  ctx.moveTo(5, -19);
  ctx.lineTo(11, -stride);
  ctx.stroke();

  ctx.fillStyle = '#334f45';
  ctx.fillRect(-12, -43, 24, 27);
  ctx.fillStyle = color;
  ctx.fillRect(-9, -42, 18, 24);

  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-10, -38);
  ctx.lineTo(-17, -23 - stride * 0.4);
  ctx.moveTo(10, -38);
  ctx.lineTo(17, -26 + stride * 0.4);
  ctx.stroke();

  ctx.fillStyle = '#d6a47e';
  ctx.beginPath();
  ctx.arc(0, -51, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
