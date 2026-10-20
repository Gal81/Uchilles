import { createObstacle } from './entities/obstacle.ts';
import type { Lane } from './entities/runner.ts';
import {
  createPlayer,
  createPursuers,
} from './entities/runner.ts';
import type { GameState } from './types.ts';

export function createGameState(): GameState {
  return {
    player: createPlayer(),
    pursuers: createPursuers(),
    roadOffset: 0,
    obstacles: [],
    spawnTimer: 0,
    nextObstacleId: 0,
    status: 'running',
    distance: 0,
  };
}

export function changePlayerLane(game: GameState, direction: -1 | 1) {
  if (game.status !== 'running') return;

  const nextLane = game.player.lane + direction;
  if (nextLane === 0 || nextLane === 1 || nextLane === 2) {
    game.player.lane = nextLane;
  }
}

export function updateGame(game: GameState, dt: number) {
  if (game.status !== 'running') return;

  game.distance += dt * 8;
  game.roadOffset = (game.roadOffset + dt * 0.55) % 1;
  game.spawnTimer += dt;

  game.player.animationTime += dt;
  game.pursuers.forEach((pursuer) => {
    pursuer.animationTime += dt;
  });

  if (game.spawnTimer >= 1.35) {
    game.spawnTimer = 0;

    const lanes: Lane[] = [0, 1, 2];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const kind = Math.random() < 0.65 ? 'barrier' : 'car';
    game.obstacles.push(
      createObstacle(game.nextObstacleId++, lane, kind),
    );
  }

  game.obstacles.forEach((obstacle) => {
    obstacle.z += dt * 0.27;
    obstacle.animationTime += dt;

    if (
      obstacle.lane === game.player.lane &&
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