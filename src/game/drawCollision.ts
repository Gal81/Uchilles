import type { CollisionEffect } from './types.ts';
import { projectLanePosition } from './projection.ts';

const COLLISION_EFFECT_DURATION = 1.1;

export function drawCollisionEffect(
  ctx: CanvasRenderingContext2D,
  effect: CollisionEffect,
  width: number,
  height: number,
) {
  const progress = effect.elapsed / COLLISION_EFFECT_DURATION;
  const opacity = 1 - progress;
  const { x, y, scale } = projectLanePosition(
    width,
    height,
    effect.lanePosition,
    effect.z,
  );
  const radius = (5 + progress * 24) * scale;

  ctx.save();
  const burstRadius = (27 + progress * 7) * scale;
  const burstCenterY = y - (52 + progress * 9) * scale;
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#fff2a8';
  ctx.strokeStyle = '#6b3027';
  ctx.lineWidth = 2 * scale;
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2 - Math.PI / 2;
    const pointRadius = burstRadius * (i % 2 === 0 ? 1 : 0.68);
    const pointX = x + Math.cos(angle) * pointRadius;
    const pointY = burstCenterY + Math.sin(angle) * pointRadius * 0.72;
    if (i === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = opacity;
  ctx.strokeStyle = '#ffe7a1';
  ctx.lineWidth = (3 - progress * 1.5) * scale;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#ff9b45';
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const innerRadius = radius * 0.55;
    const outerRadius = radius + (4 + (i % 3) * 2) * scale;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(angle) * innerRadius,
      Math.sin(angle) * innerRadius,
    );
    ctx.lineTo(
      Math.cos(angle) * outerRadius,
      Math.sin(angle) * outerRadius,
    );
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
  }

  ctx.fillStyle = '#7b2824';
  ctx.font = `900 ${12 * scale}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    effect.exclamation,
    x,
    burstCenterY,
    burstRadius * 1.45,
  );
  ctx.restore();
}
