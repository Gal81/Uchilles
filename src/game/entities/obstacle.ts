import type { Lane } from './runner.ts';

type ObstacleBase = {
  id: number;
  lane: Lane;
  z: number;
  animationTime: number;
};

export type BarrierObstacle = ObstacleBase & {
  kind: 'barrier';
};

export type CarObstacle = ObstacleBase & {
  kind: 'car';
};

export type Obstacle = BarrierObstacle | CarObstacle;

export function createObstacle(
  id: number,
  lane: Lane,
  kind: Obstacle['kind'],
): Obstacle {
  return {
    id,
    lane,
    z: 0.08,
    animationTime: 0,
    kind,
  };
}
