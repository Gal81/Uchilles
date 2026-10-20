export function drawRunner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';

  ctx.strokeStyle = '#202833';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-5, -19);
  ctx.lineTo(-10, 0);
  ctx.moveTo(5, -19);
  ctx.lineTo(11, 0);
  ctx.stroke();

  ctx.fillStyle = '#334f45';
  ctx.fillRect(-12, -43, 24, 27);
  ctx.fillStyle = color;
  ctx.fillRect(-9, -42, 18, 24);

  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-10, -38);
  ctx.lineTo(-17, -23);
  ctx.moveTo(10, -38);
  ctx.lineTo(17, -26);
  ctx.stroke();

  ctx.fillStyle = '#d6a47e';
  ctx.beginPath();
  ctx.arc(0, -51, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
