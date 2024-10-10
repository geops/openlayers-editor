const FORCE = { force: true };

const coordToFixed = (coordArray, decimals) => {
  const arr = [
    parseFloat(coordArray[0].toFixed(decimals)),
    parseFloat(coordArray[1].toFixed(decimals)),
  ];
  return arr;
};

describe("CAD control", () => {
  beforeEach(() => {
    cy.visit("/");

    // Draw point (click on map canvas container at x: 500 and y: 500)
    cy.get('[title="Draw Point"]').click();
    cy.get(".ol-viewport").click(500, 500, FORCE);
  });

  it("should snap new points to CAD point with CAD active", () => {
    let win;
    // Draw new point (click on map canvas container at x: 507 and y: 500)
    cy.get(".ol-viewport").trigger("mousemove", 550, 500, FORCE);
    cy.get(".ol-viewport").click(535, 500, FORCE);

    cy.window()
      .then((win2) => {
        win = win2;
      })
      .then(() => {
        const snapDistance = win.cad.properties.snapPointDist;
        const newPoint = win.editLayer.getSource().getFeatures()[1];

        // New point should have added snapping distance (use toFixed to ignore micro differences)
        expect(
          coordToFixed(newPoint.getGeometry().getCoordinates(), 5).toString(),
        ).to.equal(
          coordToFixed(
            win.map.getCoordinateFromPixel([500 + snapDistance, 500]),
            5,
          ).toString(),
        );
      });
  });
});
