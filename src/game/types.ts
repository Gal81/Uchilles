export type Obstacle = {
  id: number;
  lane: number;
  z: number;
  kind: 'barrier' | 'car';
};

export type GameState = {
  lane: number;
  roadOffset: number;
  obstacles: Obstacle[];
  spawnTimer: number;
  nextId: number;
  status: 'running' | 'over';
  distance: number;
};
