import {
  useSyncExternalStore,
  useRef,
  useEffect,
} from 'react';
import {
  createGameState,
  changePlayerLane,
  jumpPlayer,
  updateGame,
} from './game/gameState.ts';
import { drawScene } from './game/drawScene.ts';
import { getLocale, subscribeToLocale } from './locales/index.ts';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getLocale,
    getLocale,
  );
  const localeRef = useRef(locale);

  useEffect(() => {
    localeRef.current = locale;
    document.title = locale.documentTitle;
    document.documentElement.lang = locale.languageTag;
  }, [locale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let animationId = 0;
    let previousTime = 0;
    let game = createGameState();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const restart = () => {
      game = createGameState();
      previousTime = 0;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(event.key)) {
        event.preventDefault();
      }

      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        changePlayerLane(game, -1);
      }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        changePlayerLane(game, 1);
      }
      if (
        game.status === 'over' &&
        (event.key === ' ' || event.key.toLowerCase() === 'r')
      ) {
        restart();
      } else if (event.key === 'ArrowUp' && !event.repeat) {
        jumpPlayer(game);
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
        changePlayerLane(game, dx > 0 ? 1 : -1);
      } else if (dy < -35) {
        jumpPlayer(game);
      }
    };

    const tick = (time: number) => {
      const dt = previousTime
        ? Math.min((time - previousTime) / 1000, 0.05)
        : 0;
      previousTime = time;

      updateGame(game, dt);
      drawScene(ctx, game, width, height, localeRef.current);
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
        aria-label={locale.canvasLabel}
      />
    </main>
  );
}

export default App;
