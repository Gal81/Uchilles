import { createObstacle } from './entities/obstacle.ts';
import type { Obstacle } from './entities/obstacle.ts';
import type { Lane } from './entities/runner.ts';
import {
  createPlayer,
  createPursuers,
} from './entities/runner.ts';
import type { GameState } from './types.ts';

const LANE_CHANGE_DURATION = 0.85;
const PURSUER_LANE_CHANGE_DURATION = 0.55;
const PURSUER_LOOKAHEAD = 0.42;
const PLAYER_COLLISION_LANE_RADIUS = 0.4;
const ROAD_SPEED = 0.27;
const OBSTACLE_SPEED: Record<Obstacle['kind'], number> = {
  barrier: ROAD_SPEED,
  motorcycle: 0.56,
  compact: 0.46,
  sedan: 0.38,
  truck: 0.31,
  bus: 0.29,
};
const OBSTACLE_KINDS: Array<Obstacle['kind']> = [
  'barrier',
  'barrier',
  'barrier',
  'motorcycle',
  'compact',
  'compact',
  'sedan',
  'sedan',
  'truck',
  'bus',
];

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
    setRunnerLane(game.player, nextLane);
  }
}

function setRunnerLane(
  runner: { lane: Lane; lanePosition: number; laneChangeStart: number; laneChangeElapsed: number },
  lane: Lane,
) {
  if (lane === runner.lane) return;

  runner.laneChangeStart = runner.lanePosition;
  runner.laneChangeElapsed = 0;
  runner.lane = lane;
}

function isLaneBlocked(game: GameState, lane: Lane, runnerZ: number) {
  return game.obstacles.some(
    (obstacle) =>
      obstacle.lane === lane &&
      obstacle.z >= runnerZ - PURSUER_LOOKAHEAD &&
      obstacle.z <= runnerZ + 0.08,
  );
}

function avoidPursuerObstacles(game: GameState) {
  const lanes: Lane[] = [0, 1, 2];

  game.pursuers.forEach((pursuer) => {
    const blockedLanes = lanes.filter((lane) =>
      isLaneBlocked(game, lane, pursuer.z),
    );
    let desiredLane = pursuer.lane;

    if (blockedLanes.includes(pursuer.lane)) {
      const candidates = lanes
        .filter((lane) => lane !== pursuer.lane)
        .sort((a, b) => {
          const aBlocked = blockedLanes.includes(a);
          const bBlocked = blockedLanes.includes(b);
          if (aBlocked !== bBlocked) return Number(aBlocked) - Number(bBlocked);

          const aOccupied = game.pursuers.some(
            (other) => other !== pursuer && other.lane === a,
          );
          const bOccupied = game.pursuers.some(
            (other) => other !== pursuer && other.lane === b,
          );
          if (aOccupied !== bOccupied) return Number(aOccupied) - Number(bOccupied);

          return Math.abs(a - pursuer.lane) - Math.abs(b - pursuer.lane);
        });

      desiredLane = candidates[0] ?? pursuer.lane;
    } else if (
      pursuer.lane !== pursuer.homeLane &&
      !blockedLanes.includes(pursuer.homeLane) &&
      !game.pursuers.some(
        (other) => other !== pursuer && other.lane === pursuer.homeLane,
      )
    ) {
      desiredLane = pursuer.homeLane;
    }

    setRunnerLane(pursuer, desiredLane);
  });
}

function updateRunnerLane(
  runner: {
    lane: Lane;
    lanePosition: number;
    laneChangeStart: number;
    laneChangeElapsed: number;
  },
  dt: number,
  duration: number,
) {
  if (runner.lanePosition === runner.lane) return;

  runner.laneChangeElapsed = Math.min(
    runner.laneChangeElapsed + dt,
    duration,
  );
  const progress = runner.laneChangeElapsed / duration;
  const easedProgress =
    progress * progress * progress * (progress * (progress * 6 - 15) + 10);
  runner.lanePosition =
    runner.laneChangeStart +
    (runner.lane - runner.laneChangeStart) * easedProgress;
}

export function updateGame(game: GameState, dt: number) {
  if (game.status !== 'running') return;

  game.distance += dt * 8;
  game.roadOffset = (game.roadOffset + dt * ROAD_SPEED) % 1;
  game.spawnTimer += dt;

  game.player.animationTime += dt;
  updateRunnerLane(game.player, dt, LANE_CHANGE_DURATION);

  game.pursuers.forEach((pursuer) => {
    pursuer.animationTime += dt;
  });

  if (game.spawnTimer >= 1.35) {
    game.spawnTimer = 0;

    const lanes: Lane[] = [0, 1, 2];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const kind =
      OBSTACLE_KINDS[Math.floor(Math.random() * OBSTACLE_KINDS.length)];
    game.obstacles.push(
      createObstacle(game.nextObstacleId++, lane, kind),
    );
  }

  game.obstacles.forEach((obstacle) => {
    obstacle.z += dt * OBSTACLE_SPEED[obstacle.kind];
    obstacle.animationTime += dt;

    if (
      Math.abs(obstacle.lane - game.player.lanePosition) <=
        PLAYER_COLLISION_LANE_RADIUS &&
      obstacle.z >= 0.63 &&
      obstacle.z <= 0.68
    ) {
      game.status = 'over';
    }
  });

  avoidPursuerObstacles(game);

  game.pursuers.forEach((pursuer) => {
    updateRunnerLane(pursuer, dt, PURSUER_LANE_CHANGE_DURATION);
  });

  game.obstacles = game.obstacles.filter(
    (obstacle) => obstacle.z < 1,
  );
}