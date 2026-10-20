export type ProjectedPosition = {
  x: number;
  y: number;
  scale: number;
};

export const ROAD_FEATURE_SECTIONS = 8;

export function getRoadDepth(z: number) {
  return z * z;
}

export function getRoadHalfWidth(width: number, depth: number) {
  return width * (0.12 + 0.46 * depth);
}

export function projectLanePosition(
  width: number,
  height: number,
  lane: number,
  z: number,
): ProjectedPosition {
  const horizonY = height * 0.29;
  const depth = getRoadDepth(z);
  const roadWidth = getRoadHalfWidth(width, depth) * 2;

  return {
    x: width / 2 + (lane - 1) * roadWidth / 3,
    y: horizonY + (height - horizonY) * depth,
    scale: 0.25 + z * 1.2,
  };
}
