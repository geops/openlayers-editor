const getEquationOfLine = (coordA, coordB) => {
  // Get the equation of line containing A and B
  // y = mx + b
  // where m = (yB-yA)/(xB-xA)
  // an b = yB - mXB;
  const [xA, yA] = coordA;
  const [xB, yB] = coordB;
  const m = (yB - yA) / (xB - xA);
  const b = yB - m * xB;
  return (x) => {
    return m * x + b;
  };
};

export default getEquationOfLine;
