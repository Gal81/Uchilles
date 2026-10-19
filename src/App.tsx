import { useEffect, useRef } from 'react';
import './App.css';

type GameState = {
  lane: number;
  roadOffset: number;
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    const game: GameState = {
      lane: 1,
      roadOffset: 0,
    };

    let frameId = 0;
    let previousTime = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let touchStartX = 0;
    let touchStartY = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawRunner = (
      x: number,
      y: number,
      scale: number,
      color: string,
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Ноги
      ctx.strokeStyle = '#20252b';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(-7, -12);
      ctx.lineTo(-11, 2);
      ctx.moveTo(7, -12);
      ctx.lineTo(12, 2);
      ctx.stroke();

      // Рюкзак
      ctx.fillStyle = '#465b4b';
      ctx.fillRect(-15, -48, 30, 29);

      // Тело
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-17, -52, 34, 39, 8);
      ctx.fill();

      // Голова сзади
      ctx.fillStyle = '#d7a27d';
      ctx.beginPath();
      ctx.arc(0, -62, 12, 0, Math.PI * 2);
      ctx.fill();

      // Волосы
      ctx.fillStyle = '#49382e';
      ctx.beginPath();
      ctx.arc(0, -65, 12, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const draw = (time: number) => {
      const dt = previousTime
        ? Math.min((time - previousTime) / 1000, 0.05)
        : 0;

      previousTime = time;
      game.roadOffset = (game.roadOffset + dt * 0.55) % 1;

      ctx.clearRect(0, 0, width, height);

      // Небо
      const sky = ctx.createLinearGradient(0, 0, 0, height * 0.55);
      sky.addColorStop(0, '#8ec9e8');
      sky.addColorStop(1, '#e5d6ae');

      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const horizonY = height * 0.29;
      const roadTop = width * 0.12;
      const roadBottom = width * 0.98;
      const centerX = width / 2;

      // Городские здания
      for (let i = 0; i < 12; i++) {
        const side = i < 6 ? -1 : 1;
        const index = i % 6;
        const depth = index / 6;
        const scale = 0.3 + depth * 0.8;
        const x = centerX + side * (roadTop * 1.5 + depth * width * 0.5);
        const buildingW = width * 0.09 * scale;
        const buildingH = height * 0.12 * scale;

        ctx.fillStyle = index % 2 ? '#a9a69b' : '#7e9295';
        ctx.fillRect(
          x - buildingW / 2,
          horizonY - buildingH,
          buildingW,
          buildingH,
        );

        ctx.fillStyle = '#d9d4b7';

        for (let row = 0; row < 3; row++) {
          ctx.fillRect(
            x - buildingW * 0.3,
            horizonY - buildingH + row * buildingH * 0.27,
            buildingW * 0.18,
            buildingH * 0.12,
          );
          ctx.fillRect(
            x + buildingW * 0.08,
            horizonY - buildingH + row * buildingH * 0.27,
            buildingW * 0.18,
            buildingH * 0.12,
          );
        }
      }

      // Дорога с перспективой
      ctx.fillStyle = '#565b60';
      ctx.beginPath();
      ctx.moveTo(centerX - roadTop / 2, horizonY);
      ctx.lineTo(centerX + roadTop / 2, horizonY);
      ctx.lineTo(centerX + roadBottom / 2, height);
      ctx.lineTo(centerX - roadBottom / 2, height);
      ctx.closePath();
      ctx.fill();

      // Обочины
      ctx.strokeStyle = '#d8c7a0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX - roadTop / 2, horizonY);
      ctx.lineTo(centerX - roadBottom / 2, height);
      ctx.moveTo(centerX + roadTop / 2, horizonY);
      ctx.lineTo(centerX + roadBottom / 2, height);
      ctx.stroke();

      // Разметка, движущаяся к игроку
      for (let i = 0; i < 12; i++) {
        const progress = (i / 12 + game.roadOffset) % 1;
        const perspective = progress * progress;
        const y = horizonY + (height - horizonY) * perspective;
        const roadWidth = roadTop + (roadBottom - roadTop) * perspective;
        const dashH = 2 + perspective * 22;

        ctx.fillStyle = '#e8e4d7';

        for (const divider of [-1 / 6, 1 / 6]) {
          ctx.fillRect(
            centerX + roadWidth * divider - 1,
            y,
            2 + perspective * 2,
            dashH,
          );
        }
      }

      // Преследователи: видны позади героя
      const pursuerY = height * 0.69;
      const pursuerScale = Math.max(0.5, height / 800);

      drawRunner(
        centerX - width * 0.12,
        pursuerY,
        pursuerScale * 0.65,
        '#777e87',
      );

      drawRunner(
        centerX + width * 0.12,
        pursuerY,
        pursuerScale * 0.65,
        '#777e87',
      );

      // Главный герой
      const laneOffset = (game.lane - 1) * width * 0.23;

      drawRunner(
        centerX + laneOffset,
        height * 0.58,
        Math.max(0.8, height / 600),
        '#e7b44c',
      );

      // HUD
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('УХИЛЛЕС', centerX, 38);

      ctx.font = '13px system-ui';
      ctx.fillStyle = '#f3f3f3';
      ctx.fillText('Свайпай, чтобы двигаться', centerX, 60);

      frameId = requestAnimationFrame(draw);
    };

    const moveLane = (direction: -1 | 1) => {
      game.lane = Math.max(0, Math.min(2, game.lane + direction));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'a') {
        moveLane(-1);
      }

      if (event.key === 'ArrowRight' || event.key === 'd') {
        moveLane(1);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        moveLane(dx > 0 ? 1 : -1);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });

    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <main className="game-shell">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        aria-label="Ухиллес — городской раннер"
      />
    </main>
  );
}

export default App;
