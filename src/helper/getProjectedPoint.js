const dotProduct = (e1, e2) => {
  return e1[0] * e2[0] + e1[1] * e2[1];
};

/**
 * Get projected point P' of P on line e1. Faster version.
 * @return projected point p.
 * This code comes from section 5 of http://www.sunshine2k.de/coding/java/PointOnLine/PointOnLine.html.
 * The dotProduct function had a bug in the html page. It's fixed here.
 */
const getProjectedPoint = (p, v1, v2) => {
  // get dot product of e1, e2
  const e1 = [v2[0] - v1[0], v2[1] - v1[1]];
  const e2 = [p[0] - v1[0], p[1] - v1[1]];
  const valDp = dotProduct(e1, e2);

  // get squared length of e1
  const len2 = e1[0] * e1[0] + e1[1] * e1[1];
  const res = [v1[0] + (valDp * e1[0]) / len2, v1[1] + (valDp * e1[1]) / len2];
  return res;
};
export default getProjectedPoint;
