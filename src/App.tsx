import { useEffect, useRef } from 'react';
import './App.css';

type Obstacle = {
  id: number;
  lane: number;
  z: number;
  kind: 'barrier' | 'car';
};

type GameState = {
  lane: number;
  roadOffset: number;
  obstacles: Obstacle[];
  spawnTimer: number;
  nextId: number;
  status: 'running' | 'over';
  distance: number;
};

const createGame = (): GameState => ({
  lane: 1,
  roadOffset: 0,
  obstacles: [],
  spawnTimer: 0,
  nextId: 0,
  status: 'running',
  distance: 0,
});

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let animationId = 0;
    let previousTime = 0;
    let game = createGame();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const changeLane = (direction: number) => {
      if (game.status !== 'running') return;
      game.lane = Math.max(0, Math.min(2, game.lane + direction));
    };

    const restart = () => {
      game = createGame();
      previousTime = 0;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
      }

      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        changeLane(-1);
      }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        changeLane(1);
      }
      if (
        game.status === 'over' &&
        (event.key === ' ' || event.key.toLowerCase() === 'r')
      ) {
        restart();
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (game.status === 'over') {
        restart();
        return;
      }

      const dx = event.changedTouches[0].clientX - touchStartX;
      const dy = event.changedTouches[0].clientY - touchStartY;

      if (Math.abs(dx) > 25 && Math.abs(dx) > Math.abs(dy)) {
        changeLane(dx > 0 ? 1 : -1);
      }
    };

    const polygon = (
      points: Array<[number, number]>,
      color: string,
    ) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.closePath();
      ctx.fill();
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
      ctx.lineCap = 'round';

      // Legs
      ctx.strokeStyle = '#202833';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-5, -19);
      ctx.lineTo(-10, 0);
      ctx.moveTo(5, -19);
      ctx.lineTo(11, 0);
      ctx.stroke();

      // Body and backpack
      ctx.fillStyle = '#334f45';
      ctx.fillRect(-12, -43, 24, 27);
      ctx.fillStyle = color;
      ctx.fillRect(-9, -42, 18, 24);

      // Arms
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-10, -38);
      ctx.lineTo(-17, -23);
      ctx.moveTo(10, -38);
      ctx.lineTo(17, -26);
      ctx.stroke();

      // Head
      ctx.fillStyle = '#d6a47e';
      ctx.beginPath();
      ctx.arc(0, -51, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawObstacle = (obstacle: Obstacle) => {
      const horizonY = height * 0.29;
      const z = obstacle.z;
      const depth = z * z;
      const roadTop = width * 0.24;
      const roadBottom = width * 1.16;
      const roadWidth = roadTop + (roadBottom - roadTop) * depth;
      const centerX = width / 2;
      const laneX = centerX + (obstacle.lane - 1) * roadWidth / 3;
      const y = horizonY + (height - horizonY) * depth;
      const scale = 0.25 + z * 1.2;

      ctx.save();
      ctx.translate(laneX, y);
      ctx.scale(scale, scale);

      if (obstacle.kind === 'barrier') {
        ctx.fillStyle = '#e4d9c5';
        ctx.fillRect(-22, -27, 44, 27);
        ctx.fillStyle = '#d65343';
        ctx.fillRect(-22, -22, 44, 7);
        ctx.fillRect(-22, -7, 44, 7);
      } else {
        ctx.fillStyle = '#283b49';
        ctx.fillRect(-23, -43, 46, 43);
        ctx.fillStyle = '#9eb9bd';
        ctx.fillRect(-16, -36, 32, 12);
        ctx.fillStyle = '#e7b45b';
        ctx.fillRect(-18, -5, 8, 4);
        ctx.fillRect(10, -5, 8, 4);
      }

      ctx.restore();
    };

    const drawScene = () => {
      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, '#8ab6c1');
      sky.addColorStop(1, '#e5d6b7');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const horizonY = height * 0.29;
      const centerX = width / 2;

      // City blocks
      for (let i = 0; i < 12; i++) {
        const x = (i / 12) * width;
        const buildingHeight =
          height * (0.08 + ((i * 37) % 12) * 0.009);
        ctx.fillStyle = i % 2 ? '#71858a' : '#a2a39a';
        ctx.fillRect(x, horizonY - buildingHeight, width / 13, buildingHeight);

        ctx.fillStyle = '#d9c7a5';
        for (let j = 0; j < 3; j++) {
          ctx.fillRect(
            x + 5,
            horizonY - buildingHeight + 10 + j * 14,
            4,
            5,
          );
        }
      }

      // Road
      polygon(
        [
          [centerX - width * 0.12, horizonY],
          [centerX + width * 0.12, horizonY],
          [width * 1.08, height],
          [-width * 0.08, height],
        ],
        '#4a5357',
      );

      // Road edges
      ctx.strokeStyle = '#e7d7b5';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - width * 0.12, horizonY);
      ctx.lineTo(-width * 0.08, height);
      ctx.moveTo(centerX + width * 0.12, horizonY);
      ctx.lineTo(width * 1.08, height);
      ctx.stroke();

      // Lane markers
      for (const divider of [-1, 1]) {
        for (let i = 0; i < 9; i++) {
          const z = ((i / 9 + game.roadOffset) % 1);
          const depth = z * z;
          const y = horizonY + (height - horizonY) * depth;
          const roadWidth = width * 0.24 + width * 0.83 * depth;
          const x = centerX + divider * roadWidth * 0.155;
          const markerHeight = 3 + depth * 24;
          ctx.fillStyle = '#d7d4c8';
          ctx.fillRect(x - 1.5, y, 3 + depth * 2, markerHeight);
        }
      }

      // Obstacles
      game.obstacles
        .slice()
        .sort((a, b) => a.z - b.z)
        .forEach(drawObstacle);

      // Pursuers — closer to the camera than the player
      drawRunner(width * 0.30, height * 0.78, 1.15, '#475a67');
      drawRunner(width * 0.70, height * 0.78, 1.15, '#475a67');

      // Player
      const playerDepth = 0.64 * 0.64;
      const playerRoadWidth =
        width * 0.24 + (width * 1.16 - width * 0.24) * playerDepth;

      const playerX =
        centerX + (game.lane - 1) * playerRoadWidth / 3;
      drawRunner(playerX, height * 0.58, 1.05, '#d6a85c');

      // HUD
      ctx.fillStyle = '#14242b';
      ctx.font = 'bold 23px system-ui';
      ctx.fillText('УХИЛЛЕС', 18, 38);

      ctx.font = '14px system-ui';
      ctx.fillText(`Дистанция: ${Math.floor(game.distance)} м`, 18, 61);

      if (game.status === 'over') {
        ctx.fillStyle = 'rgba(13, 24, 31, 0.76)';
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px system-ui';
        ctx.fillText('Столкновение!', centerX, height * 0.43);

        ctx.font = '17px system-ui';
        ctx.fillText(
          `Дистанция: ${Math.floor(game.distance)} м`,
          centerX,
          height * 0.43 + 35,
        );
        ctx.fillText('Нажми R, пробел или коснись экрана', centerX, height * 0.43 + 72);
        ctx.textAlign = 'start';
      }
    };

    const tick = (time: number) => {
      const dt = previousTime
        ? Math.min((time - previousTime) / 1000, 0.05)
        : 0;
      previousTime = time;

      if (game.status === 'running') {
        game.distance += dt * 8;
        game.roadOffset = (game.roadOffset + dt * 0.55) % 1;
        game.spawnTimer += dt;

        if (game.spawnTimer >= 1.35) {
          game.spawnTimer = 0;

          const lane = Math.floor(Math.random() * 3);
          const kind: Obstacle['kind'] =
            Math.random() < 0.65 ? 'barrier' : 'car';

          game.obstacles.push({
            id: game.nextId++,
            lane,
            z: 0.08,
            kind,
          });
        }

        game.obstacles.forEach((obstacle) => {
          obstacle.z += dt * 0.27;

          // Collision zone aligned with the player's feet.
          if (
            obstacle.lane === game.lane &&
            obstacle.z >= 0.63 &&
            obstacle.z <= 0.68
          ) {
            game.status = 'over';
          }
        });

        game.obstacles = game.obstacles.filter(
          (obstacle) => obstacle.z < 1,
        );
      }

      drawScene();
      animationId = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });

    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
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
