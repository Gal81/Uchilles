export type ProjectedPosition = {
  x: number;
  y: number;
  scale: number;
};

export function projectLanePosition(
  width: number,
  height: number,
  lane: number,
  z: number,
): ProjectedPosition {
  const horizonY = height * 0.29;
  const depth = z * z;
  const roadWidth = width * 0.24 + (width * 1.16 - width * 0.24) * depth;

  return {
    x: width / 2 + (lane - 1) * roadWidth / 3,
    y: horizonY + (height - horizonY) * depth,
    scale: 0.25 + z * 1.2,
  };
}
