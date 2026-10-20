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

function drawLeg(
  ctx: CanvasRenderingContext2D,
  hipX: number,
  footX: number,
  footY: number,
  color: string,
  bootColor: string,
) {
  const kneeX = hipX + (footX - hipX) * 0.48;
  const kneeY = -11 + (footY + 1) * 0.4;
  const ankleX = footX;
  const ankleY = footY + 2;

  drawSegment(ctx, hipX, -21, kneeX, kneeY, color, 6);
  drawSegment(ctx, kneeX, kneeY, ankleX, ankleY, color, 4.5);

  ctx.fillStyle = bootColor;
  ctx.beginPath();
  ctx.roundRect(ankleX - 3, ankleY - 1, 6, 5, 2);
  ctx.fill();

  ctx.strokeStyle = '#1f292b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ankleX - 2, ankleY + 2);
  ctx.lineTo(ankleX + 2, ankleY + 2);
  ctx.stroke();
}

export function drawHero(
  ctx: CanvasRenderingContext2D,
  time: number,
  jumpHeight = 0,
  jumpProgress = 0,
) {
  const progress = Math.max(0, Math.min(1, jumpProgress));
  const airborne = Math.sin(progress * Math.PI);
  const anticipation =
    progress < 0.16 ? Math.sin((progress / 0.16) * Math.PI) : 0;
  const landing = progress > 0.82 ? (progress - 0.82) / 0.18 : 0;
  const phase = time * 9;
  const leftStride = Math.sin(phase);
  const rightStride = Math.sin(phase + Math.PI);
  const leftFootY =
    leftStride * 3 * (1 - airborne) -
    Math.max(0, -leftStride) * 4 * (1 - airborne) -
    airborne * 8 +
    anticipation * 2;
  const rightFootY =
    rightStride * 3 * (1 - airborne) -
    Math.max(0, -rightStride) * 4 * (1 - airborne) -
    airborne * 8 +
    anticipation * 2;
  const bob = (1 - Math.cos(phase * 2)) * 0.7;
  const leftArmSwing = -leftStride * (1 - airborne);
  const rightArmSwing = -rightStride * (1 - airborne);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.fillStyle = `rgba(20, 25, 27, ${0.3 - airborne * 0.16})`;
  ctx.beginPath();
  ctx.ellipse(0, 4, 15 - airborne * 4, 4 - airborne, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(0, -bob - jumpHeight + anticipation * 3 + landing * 2);

  // Legs alternate in depth and lift, with the rear leg drawn first.
  drawLeg(
    ctx,
    3 - airborne,
    3 - airborne + rightStride * 0.8 * (1 - airborne),
    rightFootY,
    '#594536',
    '#28383a',
  );
  drawLeg(
    ctx,
    -3 + airborne,
    -3 + airborne - leftStride * 0.8 * (1 - airborne),
    leftFootY,
    '#785943',
    '#34464a',
  );

  // Arms counter-swing with their matching legs, as in a natural run.
  const rightElbowY = -31 + rightArmSwing * 2.5 - airborne * 5;
  const rightHandY = -24 + rightArmSwing * 5 - airborne * 9;
  drawSegment(ctx, 8, -39, 10, rightElbowY, '#704936', 5);
  drawSegment(
    ctx,
    10,
    rightElbowY,
    9 + rightArmSwing * 1.5 - airborne * 2,
    rightHandY,
    '#a96a43',
    4,
  );
  const leftElbowY = -31 + leftArmSwing * 2.5 - airborne * 5;
  const leftHandY = -24 + leftArmSwing * 5 - airborne * 9;
  drawSegment(ctx, -8, -39, -10, leftElbowY, '#704936', 5);
  drawSegment(
    ctx,
    -10,
    leftElbowY,
    -9 - leftArmSwing * 1.5 + airborne * 2,
    leftHandY,
    '#bd783d',
    4,
  );

  // Back-facing tunic silhouette.
  ctx.fillStyle = '#34453a';
  ctx.beginPath();
  ctx.moveTo(-7, -43);
  ctx.quadraticCurveTo(0, -46, 7, -43);
  ctx.lineTo(11, -25);
  ctx.lineTo(8, -20);
  ctx.lineTo(-8, -20);
  ctx.lineTo(-11, -25);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#b97640';
  ctx.beginPath();
  ctx.moveTo(-5, -41);
  ctx.quadraticCurveTo(0, -43, 5, -41);
  ctx.lineTo(8, -26);
  ctx.lineTo(6, -23);
  ctx.lineTo(-6, -23);
  ctx.lineTo(-8, -26);
  ctx.closePath();
  ctx.fill();

  // Back seam and hem.
  ctx.strokeStyle = '#d99855';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -40);
  ctx.lineTo(0, -29);
  ctx.moveTo(-7, -24);
  ctx.quadraticCurveTo(0, -22, 7, -24);
  ctx.stroke();

  // Backpack straps and central pack make the rear-facing view clear.
  ctx.strokeStyle = '#443b2d';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-5, -41);
  ctx.lineTo(-7, -27);
  ctx.moveTo(5, -41);
  ctx.lineTo(7, -27);
  ctx.stroke();

  ctx.fillStyle = '#263d35';
  ctx.beginPath();
  ctx.roundRect(-6, -41, 12, 17, 3);
  ctx.fill();
  ctx.fillStyle = '#3b5745';
  ctx.beginPath();
  ctx.roundRect(-5, -39, 10, 11, 2);
  ctx.fill();
  ctx.fillStyle = '#aa7140';
  ctx.beginPath();
  ctx.roundRect(-3, -26, 6, 3, 1);
  ctx.fill();
  ctx.fillStyle = '#d8ad66';
  ctx.fillRect(-1, -36, 2, 2);

  // Neck and hair are shown only from behind; no facial features.
  ctx.fillStyle = '#bc805d';
  ctx.fillRect(-3, -47, 6, 5);
  ctx.fillStyle = '#49372f';
  ctx.beginPath();
  ctx.moveTo(-7, -51);
  ctx.quadraticCurveTo(-9, -61, -2, -62);
  ctx.quadraticCurveTo(6, -63, 8, -56);
  ctx.lineTo(7, -49);
  ctx.quadraticCurveTo(4, -46, 0, -48);
  ctx.quadraticCurveTo(-4, -46, -7, -49);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
