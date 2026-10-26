import {
  useSyncExternalStore,
  useRef,
  useEffect,
  useState,
} from 'react';
import busStopImageUrl from './assets/BusStop.png';
import bushImageUrl from './assets/Bush.png';
import dniproImageUrl from './assets/Dnipro.png';
import heroImageUrl from './assets/Hero.png';
import obstaclesImageUrl from './assets/Obstacles.png';
import pursuerImageUrl from './assets/Pursuer.png';
import splashImageUrl from './assets/splash.jpg';
import studioLogoImageUrl from './assets/studio-logo.png';
import treeImageUrl from './assets/Tree.png';
import {
  createGameState,
  changePlayerLane,
  jumpPlayer,
  updateGame,
} from './game/gameState.ts';
import { drawScene } from './game/drawScene.ts';
import { getLocale, subscribeToLocale } from './locales/index.ts';
import './App.css';

const GAME_ASSETS = [
  busStopImageUrl,
  bushImageUrl,
  dniproImageUrl,
  heroImageUrl,
  obstaclesImageUrl,
  pursuerImageUrl,
  splashImageUrl,
  treeImageUrl,
];
const INTRO_SCREEN_DURATION = 2000;

function preloadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
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
    const introTimer = window.setTimeout(
      () => setShowIntro(false),
      INTRO_SCREEN_DURATION,
    );

    return () => window.clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    let isActive = true;
    let loadingTimer = 0;
    const startedAt = performance.now();

    void Promise.allSettled(GAME_ASSETS.map(preloadImage)).then((results) => {
      if (!isActive) return;

      const failedAssets = results.flatMap((result) =>
        result.status === 'rejected' ? [result.reason] : [],
      );

      if (failedAssets.length > 0) {
        failedAssets.forEach((error) => console.error(error));
        setLoadingError('Some game images could not be loaded.');
      }

      const remainingDisplayTime = Math.max(
        0,
        800 - (performance.now() - startedAt),
      );
      loadingTimer = window.setTimeout(() => {
        if (isActive) setIsLoading(false);
      }, remainingDisplayTime);
    });

    return () => {
      isActive = false;
      window.clearTimeout(loadingTimer);
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

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
  }, [hasStarted]);

  return (
    <main className="game-shell">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        aria-label={locale.canvasLabel}
      />
      {showIntro && !hasStarted && (
        <div className="studio-splash">
          <img
            className="studio-splash-logo"
            src={studioLogoImageUrl}
            alt="Very Powerful Studio"
          />
        </div>
      )}
      {!hasStarted && (
        <div
          className={`loading-screen${showIntro ? ' loading-screen-hidden' : ''}`}
          role={isLoading ? 'status' : undefined}
          aria-label={isLoading ? 'Loading game' : 'Game start screen'}
        >
          <img src={splashImageUrl} alt="" />
          {loadingError && (
            <span className="loading-error">{loadingError}</span>
          )}
          <span className="build-version">{__BUILD_VERSION__}</span>
          <button
            className="start-button"
            type="button"
            disabled={isLoading}
            onClick={() => setHasStarted(true)}
          >
            {locale.startLabel}
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
