import { createObstacle } from './entities/obstacle.ts';
import type { Obstacle } from './entities/obstacle.ts';
import type { Lane } from './entities/runner.ts';
import {
  createPlayer,
  createPursuer,
  createPursuers,
} from './entities/runner.ts';
import type { GameState } from './types.ts';

const LANE_CHANGE_DURATION = 0.85;
const PURSUER_LANE_CHANGE_DURATION = 0.55;
const PURSUER_LOOKAHEAD = 0.42;
const PURSUER_APPROACH_SPEED = 0.035;
const PURSUER_ENTRY_SPEED = 0.18;
const PURSUER_CATCH_DEPTH_MARGIN = 0.015;
const PURSUER_CATCH_LANE_RADIUS = 0.25;
const PLAYER_COLLISION_LANE_RADIUS = 0.4;
const JUMP_DURATION = 0.72;
const JUMP_RECHARGE_DURATION = 2.8;
const JUMP_HEIGHT = 34;
const JUMP_COLLISION_HEIGHT = 13;
const PURSUER_COLLISION_LANE_RADIUS = 0.36;
const PURSUER_RESPAWN_DELAY = 3.5;
const PURSUER_FATIGUE_RATE = 0.012;
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
const UNJUMPABLE_OBSTACLE_KINDS: Obstacle['kind'][] = ['truck', 'bus'];

export function createGameState(): GameState {
  return {
    player: createPlayer(),
    pursuers: createPursuers(),
    roadOffset: 0,
    obstacles: [],
    spawnTimer: 0,
    nextObstacleId: 0,
    status: 'running',
    endReason: null,
    distance: 0,
    pursuerRespawnTimer: 0,
    nextPursuerId: 0,
  };
}

export function changePlayerLane(game: GameState, direction: -1 | 1) {
  if (game.status !== 'running') return;

  const nextLane = game.player.lane + direction;
  if (nextLane === 0 || nextLane === 1 || nextLane === 2) {
    setRunnerLane(game.player, nextLane);
  }
}

export function jumpPlayer(game: GameState) {
  if (game.status !== 'running') return;
  if (game.player.jumpCharge < 1 || game.player.jumpElapsed !== null) return;

  game.player.jumpCharge = 0;
  game.player.jumpElapsed = 0;
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

function hasPursuerCollision(game: GameState, pursuer: GameState['pursuers'][number]) {
  return game.obstacles.some(
    (obstacle) =>
      obstacle.z >= pursuer.z - 0.035 &&
      obstacle.z <= pursuer.z + 0.035 &&
      Math.abs(obstacle.lane - pursuer.lanePosition) <=
        PURSUER_COLLISION_LANE_RADIUS,
  );
}

function replenishPursuers(game: GameState, dt: number) {
  if (game.pursuers.length >= 2) {
    game.pursuerRespawnTimer = 0;
    return;
  }

  game.pursuerRespawnTimer += dt;
  if (game.pursuerRespawnTimer < PURSUER_RESPAWN_DELAY) return;

  const occupiedLanes = new Set(game.pursuers.map((pursuer) => pursuer.homeLane));
  const lanes: Lane[] = [0, 2];
  const missingLanes = lanes.filter((lane) => !occupiedLanes.has(lane));

  missingLanes.forEach((lane) => {
    const id = `pursuer-replacement-${game.nextPursuerId++}`;
    game.pursuers.push(createPursuer(lane, id, true));
  });
  game.pursuerRespawnTimer = 0;
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
  game.player.jumpCharge = Math.min(
    1,
    game.player.jumpCharge + dt / JUMP_RECHARGE_DURATION,
  );
  if (game.player.jumpElapsed !== null) {
    game.player.jumpElapsed += dt;
    if (game.player.jumpElapsed >= JUMP_DURATION) {
      game.player.jumpElapsed = null;
      game.player.jumpHeight = 0;
      game.player.jumpProgress = 0;
    } else {
      const jumpProgress = game.player.jumpElapsed / JUMP_DURATION;
      game.player.jumpProgress = jumpProgress;
      game.player.jumpHeight =
        Math.sin(jumpProgress * Math.PI) * JUMP_HEIGHT;
    }
  }

  game.pursuers.forEach((pursuer) => {
    pursuer.animationTime += dt;
    pursuer.fatigue = Math.min(1, pursuer.fatigue + dt * PURSUER_FATIGUE_RATE);
    const sharesPlayerLane =
      Math.abs(pursuer.lanePosition - game.player.lanePosition) <=
      PLAYER_COLLISION_LANE_RADIUS;
    const targetZ =
      pursuer.z > pursuer.homeZ
        ? pursuer.homeZ
        : sharesPlayerLane
          ? game.player.z
          : pursuer.homeZ;
    const speed =
      pursuer.z > pursuer.homeZ
        ? PURSUER_ENTRY_SPEED
        : PURSUER_APPROACH_SPEED;
    const difference = targetZ - pursuer.z;
    pursuer.z += Math.sign(difference) * Math.min(Math.abs(difference), dt * speed);
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
      (UNJUMPABLE_OBSTACLE_KINDS.includes(obstacle.kind) ||
        game.player.jumpHeight < JUMP_COLLISION_HEIGHT) &&
      Math.abs(obstacle.lane - game.player.lanePosition) <=
        PLAYER_COLLISION_LANE_RADIUS &&
      obstacle.z >= 0.63 &&
      obstacle.z <= 0.68
    ) {
      game.status = 'over';
      game.endReason = 'obstacle';
    }
  });

  avoidPursuerObstacles(game);

  game.pursuers.forEach((pursuer) => {
    updateRunnerLane(
      pursuer,
      dt,
      PURSUER_LANE_CHANGE_DURATION * (1 + pursuer.fatigue * 2),
    );
  });

  const crashedPursuers = game.pursuers.filter((pursuer) =>
    hasPursuerCollision(game, pursuer),
  );
  if (crashedPursuers.length > 0) {
    game.pursuers = game.pursuers.filter(
      (pursuer) => !crashedPursuers.includes(pursuer),
    );
  }

  if (game.pursuers.some((pursuer) =>
    Math.abs(pursuer.lanePosition - game.player.lanePosition) <=
      PURSUER_CATCH_LANE_RADIUS &&
    pursuer.z <= game.player.z + PURSUER_CATCH_DEPTH_MARGIN,
  )) {
    game.status = 'over';
    game.endReason = 'caught';
  }

  replenishPursuers(game, dt);

  game.obstacles = game.obstacles.filter(
    (obstacle) => obstacle.z < 1,
  );
}