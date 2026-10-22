import type { Pursuer } from './entities/runner.ts';

const TAUNT_INTERVAL = 9;
const TAUNT_DURATION = 2.2;

function drawSegment(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: string,
  width: number,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}

function drawCamouflage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.fillStyle = '#747b36';
  ctx.fillRect(x, y, width, height);

  const patches = [
    [1, 1, 3, 2, '#a69a45'],
    [5, 0, 2, 3, '#394b2e'],
    [8, 2, 3, 2, '#c0a64a'],
    [3, 5, 3, 2, '#48572e'],
    [7, 6, 3, 3, '#9b8436'],
    [0, 8, 4, 2, '#3c4a2d'],
    [5, 10, 3, 2, '#b5a04a'],
    [9, 11, 3, 2, '#4c5b31'],
  ] as const;

  for (const [patchX, patchY, patchWidth, patchHeight, color] of patches) {
    const clippedWidth = Math.min(patchWidth, width - patchX);
    const clippedHeight = Math.min(patchHeight, height - patchY);
    if (clippedWidth > 0 && clippedHeight > 0) {
      ctx.fillStyle = color;
      ctx.fillRect(x + patchX, y + patchY, clippedWidth, clippedHeight);
    }
  }
}

function drawLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  footX: number,
  footY: number,
  variant: number,
) {
  const kneeX = hipX + (footX - hipX) * 0.48;
  const kneeY = -11 + (footY + 1) * 0.4;
  const ankleY = footY + 2;

  drawSegment(ctx, hipX, -21, kneeX, kneeY, '#615f32', 6);
  drawSegment(ctx, kneeX, kneeY, footX, ankleY, '#73723a', 4.5);

  ctx.save();
  ctx.translate(footX - 5, ankleY - 1);
  drawCamouflage(ctx, 2, 0, 6, 4);
  ctx.fillStyle = variant ? '#353b2a' : '#292f27';
  ctx.fillRect(2, 3, 6, 1);
  ctx.restore();
}

function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  text: string,
  opacity: number,
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.font = 'bold 12px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const paddingX = 8;
  const width = ctx.measureText(text).width + paddingX * 2;
  const height = 22;
  const left = -width / 2;
  const top = -91;
  const right = left + width;
  const bottom = top + height;

  ctx.fillStyle = '#fffdf4';
  ctx.strokeStyle = '#30382a';
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  ctx.moveTo(left + width * 0.08, top);
  ctx.lineTo(left + width * 0.24, top - 3);
  ctx.lineTo(left + width * 0.29, top);
  ctx.lineTo(left + width * 0.51, top - 4);
  ctx.lineTo(left + width * 0.57, top);
  ctx.lineTo(left + width * 0.8, top - 3);
  ctx.lineTo(left + width * 0.84, top);
  ctx.lineTo(right, top + 3);
  ctx.lineTo(right - 3, top + height * 0.3);
  ctx.lineTo(right + 2, top + height * 0.38);
  ctx.lineTo(right, top + height * 0.58);
  ctx.lineTo(right - 3, bottom);
  ctx.lineTo(left + width * 0.62, bottom);
  ctx.lineTo(4, bottom + 3);
  ctx.lineTo(2, bottom + 9);
  ctx.lineTo(-3, bottom);
  ctx.lineTo(left + width * 0.34, bottom);
  ctx.lineTo(left, bottom - 2);
  ctx.lineTo(left + 3, top + height * 0.62);
  ctx.lineTo(left - 2, top + height * 0.52);
  ctx.lineTo(left + 2, top + height * 0.32);
  ctx.lineTo(left - 2, top + height * 0.24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#252a22';
  ctx.fillText(text, 0, top + height / 2, width - paddingX);
  ctx.restore();
}

export function drawMilitaryPursuer(
  ctx: CanvasRenderingContext2D,
  pursuer: Pursuer,
  taunts: readonly string[],
) {
  const phase = pursuer.animationTime * 9;
  const leftStride = Math.sin(phase);
  const rightStride = Math.sin(phase + Math.PI);
  const leftFootY =
    leftStride * 3 - Math.max(0, -leftStride) * 4;
  const rightFootY =
    rightStride * 3 - Math.max(0, -rightStride) * 4;
  const bob = (1 - Math.cos(phase * 2)) * 0.7;
  const leftArmSwing = -leftStride;
  const rightArmSwing = -rightStride;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.fillStyle = 'rgba(20, 25, 27, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(0, -bob);

  drawLeg(ctx, 3, 3 + rightStride * 0.8, rightFootY, 0);
  drawLeg(ctx, -3, -3 + leftStride * 0.8, leftFootY, 1);

  const rightElbowY = -31 + rightArmSwing * 2.5;
  const rightHandY = -24 + rightArmSwing * 5;
  drawSegment(ctx, 8, -39, 10, rightElbowY, '#46502e', 5);
  ctx.fillStyle = '#b5a04a';
  ctx.fillRect(8, rightElbowY + 1, 2, 2);
  drawSegment(
    ctx,
    10,
    rightElbowY,
    9 + rightArmSwing * 1.5,
    rightHandY,
    '#85803c',
    4,
  );

  const leftElbowY = -31 + leftArmSwing * 2.5;
  const leftHandY = -24 + leftArmSwing * 5;
  drawSegment(ctx, -8, -39, -10, leftElbowY, '#46502e', 5);
  ctx.fillStyle = '#9b8436';
  ctx.fillRect(-11, leftElbowY + 1, 2, 2);
  drawSegment(
    ctx,
    -10,
    leftElbowY,
    -9 - leftArmSwing * 1.5,
    leftHandY,
    '#a49343',
    4,
  );

  // Uniform jacket, with blocky yellow-green camouflage.
  ctx.fillStyle = '#343f2a';
  ctx.beginPath();
  ctx.moveTo(-7, -43);
  ctx.quadraticCurveTo(0, -46, 7, -43);
  ctx.lineTo(11, -25);
  ctx.lineTo(8, -20);
  ctx.lineTo(-8, -20);
  ctx.lineTo(-11, -25);
  ctx.closePath();
  ctx.fill();
  drawCamouflage(ctx, -8, -42, 16, 20);

  // Shoulder straps, belt, and compact field pack.
  ctx.strokeStyle = '#30382a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-4, -41);
  ctx.lineTo(-7, -27);
  ctx.moveTo(4, -41);
  ctx.lineTo(7, -27);
  ctx.stroke();

  ctx.fillStyle = '#42452c';
  ctx.beginPath();
  ctx.roundRect(-4, -39, 8, 13, 2);
  ctx.fill();
  ctx.fillStyle = '#59613a';
  ctx.beginPath();
  ctx.roundRect(-3, -38, 6, 8, 1);
  ctx.fill();
  ctx.fillStyle = '#b2a149';
  ctx.fillRect(-2, -36, 2, 2);
  ctx.fillStyle = '#333d2d';
  ctx.fillRect(1, -33, 2, 2);
  ctx.fillStyle = '#383624';
  ctx.fillRect(-8, -25, 16, 3);
  ctx.fillStyle = '#b1a14b';
  ctx.fillRect(-1, -25, 3, 3);

  // Neck, back of the head, and a rear-facing military field cap.
  ctx.fillStyle = '#9b7654';
  ctx.fillRect(-3, -47, 6, 5);
  ctx.fillStyle = '#bd936c';
  ctx.beginPath();
  ctx.ellipse(0, -49, 6, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-7, -50, 2, 3);
  ctx.fillRect(5, -50, 2, 3);

  ctx.fillStyle = '#8a8a42';
  ctx.beginPath();
  ctx.moveTo(-7, -51);
  ctx.lineTo(-6, -57);
  ctx.lineTo(-3, -60);
  ctx.lineTo(3, -60);
  ctx.lineTo(7, -56);
  ctx.lineTo(7, -51);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#525d32';
  ctx.fillRect(-7, -52, 14, 2);
  ctx.fillStyle = '#c1a54d';
  ctx.fillRect(-1, -56, 2, 2);
  ctx.fillStyle = '#485331';
  ctx.fillRect(-3, -49, 6, 1.5);

  ctx.restore();

  const idOffset = [...pursuer.id].reduce(
    (offset, character) => offset + character.charCodeAt(0),
    0,
  ) % TAUNT_INTERVAL;
  const elapsed = pursuer.animationTime + idOffset;
  const tauntPhase = elapsed % TAUNT_INTERVAL;
  if (tauntPhase < TAUNT_DURATION && taunts.length > 0) {
    const fadeIn = Math.min(1, tauntPhase / 0.2);
    const fadeOut = Math.min(1, (TAUNT_DURATION - tauntPhase) / 0.25);
    const tauntIndex =
      Math.floor(elapsed / TAUNT_INTERVAL) % taunts.length;
    drawSpeechBubble(ctx, taunts[tauntIndex], Math.min(fadeIn, fadeOut));
  }
}
