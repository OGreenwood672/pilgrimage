// Waypoints defining the route between each consecutive segment of the journey
// Each leg starts at segment[i] and ends at segment[i+1]

export const SEGMENT_LEGS: [number, number][][] = [
  // Leg 0: South Heath (0) -> Dover (1)
  [
    [51.7105, -0.6865], // South Heath
    [51.6740, -0.6080], // Amersham
    [51.5850, -0.4780], // Uxbridge
    [51.4816, -0.0090], // Greenwich / Thames
    [51.3780, 0.5280],  // Rochester
    [51.2800, 1.0780],  // Canterbury
    [51.1279, 1.3134],  // Dover
  ],

  // Leg 1: Dover (1) -> Calais (2)
  [
    [51.1279, 1.3134], // Dover
    [51.0500, 1.5500], // English Channel
    [50.9513, 1.8587], // Calais
  ],

  // Leg 2: Calais (2) -> Reims (3)
  [
    [50.9513, 1.8587], // Calais
    [50.7500, 2.2500], // Saint-Omer
    [50.2910, 2.7775], // Arras
    [49.8941, 3.2866], // Saint-Quentin
    [49.5641, 3.6244], // Laon
    [49.2583, 4.0317], // Reims
  ],

  // Leg 3: Reims (3) -> Besançon (4)
  [
    [49.2583, 4.0317], // Reims
    [48.9562, 4.3638], // Châlons-en-Champagne
    [48.1122, 5.1408], // Chaumont
    [47.6244, 6.1558], // Vesoul
    [47.2378, 6.0241], // Besançon
  ],

  // Leg 4: Besançon (4) -> Lausanne (5)
  [
    [47.2378, 6.0241], // Besançon
    [46.9039, 6.3547], // Pontarlier
    [46.7785, 6.6412], // Yverdon-les-Bains
    [46.5197, 6.6323], // Lausanne
  ],

  // Leg 5: Lausanne (5) -> Great St Bernard Pass (6)
  [
    [46.5197, 6.6323], // Lausanne
    [46.4580, 6.8430], // Vevey
    [46.3160, 6.9720], // Saint-Maurice
    [46.1030, 7.0730], // Martigny
    [45.9600, 7.1500], // Bourg-Saint-Pierre
    [45.8689, 7.1706], // Great St Bernard Pass
  ],

  // Leg 6: Great St Bernard Pass (6) -> Lucca (7)
  [
    [45.8689, 7.1706], // Great St Bernard Pass
    [45.7370, 7.3195], // Aosta
    [45.4660, 7.8730], // Ivrea
    [45.1850, 9.1560], // Pavia
    [45.0526, 9.6930], // Piacenza
    [44.4710, 9.9280], // Cisa Pass
    [43.8430, 10.5080], // Lucca
  ],

  // Leg 7: Lucca (7) -> Rome (8)
  [
    [43.8430, 10.5080], // Lucca
    [43.4670, 11.0420], // San Gimignano
    [43.3188, 11.3300], // Siena
    [42.9320, 11.7700], // Radicofani
    [42.6450, 11.9860], // Bolsena
    [42.4200, 12.1080], // Viterbo
    [41.9890, 12.4500], // Monte Mario
    [41.9022, 12.4568], // St. Peter's Square, Rome
  ],
];

// Generate dense smooth points between two coordinates
function interpolate(
  p1: [number, number],
  p2: [number, number],
  steps: number
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push([
      p1[0] + (p2[0] - p1[0]) * t,
      p1[1] + (p2[1] - p1[1]) * t,
    ]);
  }
  return points;
}

// Pre-compute dense points for each leg (e.g., ~20 points per sub-waypoint)
export const DENSE_LEGS: [number, number][][] = SEGMENT_LEGS.map((leg) => {
  const legPoints: [number, number][] = [];
  for (let i = 0; i < leg.length - 1; i++) {
    const subPoints = interpolate(leg[i], leg[i + 1], 15);
    // Avoid duplicating the start of the next segment
    if (i > 0) subPoints.shift();
    legPoints.push(...subPoints);
  }
  return legPoints;
});

// Full consolidated dense route
export const DENSE_ROUTE: [number, number][] = [
  SEGMENT_LEGS[0][0],
  ...DENSE_LEGS.flatMap((leg) => leg),
];

/**
 * Given a continuous stageProgress (e.g. 0.0 = segment 0, 1.0 = segment 1, 6.5 = halfway between segment 6 & 7)
 * Returns:
 * - The polyline points drawn so far
 * - The current exact tip coordinate [lat, lng] for the walker marker
 */
export function getRouteForStageProgress(stageProgress: number): {
  activePoints: [number, number][];
  currentTip: [number, number];
} {
  const totalLegs = DENSE_LEGS.length;
  const clampedProgress = Math.max(0, Math.min(totalLegs, stageProgress));

  // If at start
  if (clampedProgress <= 0) {
    const start = SEGMENT_LEGS[0][0];
    return {
      activePoints: [start, start],
      currentTip: start,
    };
  }

  const currentLegIndex = Math.min(totalLegs - 1, Math.floor(clampedProgress));
  const legFraction = clampedProgress - currentLegIndex;

  const points: [number, number][] = [];

  // Add all completed preceding legs
  for (let i = 0; i < currentLegIndex; i++) {
    points.push(...DENSE_LEGS[i]);
  }

  // Add the partial current leg
  const currentLeg = DENSE_LEGS[currentLegIndex];
  const currentLegCount = Math.max(
    1,
    Math.min(currentLeg.length, Math.floor(legFraction * currentLeg.length) + 1)
  );
  const partialCurrent = currentLeg.slice(0, currentLegCount);
  points.push(...partialCurrent);

  const currentTip = points[points.length - 1] || SEGMENT_LEGS[0][0];

  return {
    activePoints: points,
    currentTip,
  };
}
