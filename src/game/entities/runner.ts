export type Lane = 0 | 1 | 2;
export type PursuerKind = 'standard';

type RunnerBase = {
  lane: Lane;
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
};

export type Runner = PlayerRunner | Pursuer;

export function createPlayer(): PlayerRunner {
  return {
    id: 'player',
    role: 'player',
    lane: 1,
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
    z: 0.83,
    animationTime: 0,
  }));
}
