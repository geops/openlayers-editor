// If the 3 coordinnates are aligned .
const isCoordinatesAligned = (coordA, coordB, coordC) => {
  const [xA, yA] = coordA;
  const [xB, yB] = coordB;
  const [xC, yC] = coordC;
  const coeffAB = (yB - yA) / (xB - xA);
  const coeffAC = (yC - yA) / (xC - xA);
  const diff = Math.abs(coeffAC - coeffAB);

  return diff === 0;
};
export default isCoordinatesAligned;
