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

export type VehicleKind =
  | 'motorcycle'
  | 'compact'
  | 'sedan'
  | 'truck'
  | 'bus';

export type CarObstacle = ObstacleBase & {
  kind: VehicleKind;
  color: string;
};

export type Obstacle = BarrierObstacle | CarObstacle;

const VEHICLE_COLORS: Record<VehicleKind, string[]> = {
  motorcycle: ['#c64d3f', '#397c88', '#d3a447'],
  compact: ['#d45b49', '#487c58', '#d2a43d'],
  sedan: ['#356f9a', '#a64d46', '#6b7180'],
  truck: ['#bd6447', '#547c70', '#c5a24b'],
  bus: ['#d1ae4e', '#537b86', '#aa564b'],
};

export function createObstacle(
  id: number,
  lane: Lane,
  kind: Obstacle['kind'],
): Obstacle {
  if (kind !== 'barrier') {
    const colors = VEHICLE_COLORS[kind];
    return {
      id,
      lane,
      z: 0.08,
      animationTime: 0,
      kind,
      color: colors[id % colors.length],
    };
  }

  return {
    id,
    lane,
    z: 0.08,
    animationTime: 0,
    kind: 'barrier',
  };
}
