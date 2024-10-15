// Get the equation  "y = mx + b" of line containing A and B
// where m = (yB-yA)/(xB-xA)
// an b = yB - mXB;
const getEquationOfLine = (coordA, coordB) => {
  const [xA, yA] = coordA;
  const [xB, yB] = coordB;
  if (xB - xA === 0) {
    // No division by 0
    return null;
  }
  const m = (yB - yA) / (xB - xA);
  const b = yB - m * xB;
  return (x) => {
    return m * x + b;
  };
};

export default getEquationOfLine;
