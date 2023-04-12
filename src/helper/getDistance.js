/**
 * Returns the distance between 2 coordinates of a plan.
 *
 * @param {number[2]} coordA
 * @param number[2]} coordB
 * @returns number
 */
const getDistance = (coordA, coordB) => {
  const [xA, yA] = coordA;
  const [xB, yB] = coordB;
  return Math.sqrt((xB - xA) ** 2 + (yB - yA) ** 2);
};

export default getDistance;
