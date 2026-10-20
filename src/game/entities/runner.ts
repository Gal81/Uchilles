export type Lane = 0 | 1 | 2;
export type PursuerKind = 'standard';

type RunnerBase = {
  lane: Lane;
  lanePosition: number;
  laneChangeStart: number;
  laneChangeElapsed: number;
  z: number;
  animationTime: number;
};

export type PlayerRunner = RunnerBase & {
  id: 'player';
  role: 'player';
};

export type Pursuer = RunnerBase & {
  id: string;
  role: 'pursuer';
  kind: PursuerKind;
  homeLane: Lane;
};

export type Runner = PlayerRunner | Pursuer;

export function createPlayer(): PlayerRunner {
  return {
    id: 'player',
    role: 'player',
    lane: 1,
    lanePosition: 1,
    laneChangeStart: 1,
    laneChangeElapsed: 0,
    z: 0.64,
    animationTime: 0,
  };
}

export function createPursuers(): Pursuer[] {
  const lanes: Lane[] = [0, 2];
  return lanes.map((lane) => ({
    id: `pursuer-${lane}`,
    role: 'pursuer',
    kind: 'standard',
    lane,
    lanePosition: lane,
    laneChangeStart: lane,
    laneChangeElapsed: 0,
    homeLane: lane,
    z: lane === 0 ? 0.83 : 0.79,
    animationTime: 0,
  }));
}
