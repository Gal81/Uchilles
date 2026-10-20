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
  homeZ: number;
  fatigue: number;
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
  return lanes.map((lane) => createPursuer(lane));
}

export function createPursuer(
  lane: Lane,
  id = `pursuer-${lane}`,
  spawnFromBottom = false,
): Pursuer {
  const homeZ = lane === 0 ? 0.9 : 0.88;

  return {
    id,
    role: 'pursuer',
    kind: 'standard',
    lane,
    lanePosition: lane,
    laneChangeStart: lane,
    laneChangeElapsed: 0,
    homeLane: lane,
    homeZ,
    z: spawnFromBottom ? 1.12 : homeZ,
    animationTime: 0,
    fatigue: 0,
  };
}
