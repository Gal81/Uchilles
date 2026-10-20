import type { Obstacle } from './entities/obstacle.ts';
import type {
  PlayerRunner,
  Pursuer,
} from './entities/runner.ts';

export type GameState = {
  player: PlayerRunner;
  pursuers: Pursuer[];
  roadOffset: number;
  obstacles: Obstacle[];
  spawnTimer: number;
  nextObstacleId: number;
  status: 'running' | 'over';
  endReason: 'obstacle' | 'caught' | null;
  distance: number;
  pursuerRespawnTimer: number;
  nextPursuerId: number;
};
