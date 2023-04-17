/**
 * Returns the distance between 2 coordinates of a plan.
 *
 * @param {Array<number>} coordA
 * @param {Array<number>} coordB
 * @returns number
 */
const getDistance = (coordA, coordB) => {
  const [xA, yA] = coordA;
  const [xB, yB] = coordB;
  return Math.sqrt((xB - xA) ** 2 + (yB - yA) ** 2);
};

export default getDistance;
