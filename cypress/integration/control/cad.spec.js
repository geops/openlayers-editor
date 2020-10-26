const FORCE = {force: true}

const coordToFixed = (coordArray, decimals) => {
  return [
    parseFloat(coordArray[0].toFixed(decimals)),
    parseFloat(coordArray[1].toFixed(decimals))
  ];
};

describe('CAD control', function () {
  beforeEach(function () {
      cy.visit('/');
  
      // Draw point (click on map canvas container at x: 500 and y: 500)
      cy.get('[title="Draw Point"]').click();
      cy.get('.ol-overlaycontainer').click(500, 500, FORCE);
    });

  it('should not snap new points when CAD deactivated', function () {
      cy.window().then((win) => {
        // Draw new point (click on map canvas container at x: 507 and y: 500)
        cy.get('.ol-overlaycontainer').click(507, 500, FORCE).then(() => {
          const newPoint = win.editLayer.getSource().getFeatures()[1];
          // New point should not have additional snapping distance in coordinate
          expect(JSON.stringify(newPoint.getGeometry().getCoordinates()))
          .to.equal(JSON.stringify(win.map.getCoordinateFromPixel([507, 500])));
        });
      });
    });

  it('should snap new points to CAD point with CAD active', function () {
    cy.window().then((win) => {
      // Activate CAD control (click on toolbar)
      cy.get('.ole-control-cad').click();
      // Draw new point (click on map canvas container at x: 507 and y: 500)
      cy.get('.ol-overlaycontainer').click(507, 500, FORCE).then(() => {
        const snapDistance = win.cad.properties.snapPointDist;
        const newPoint = win.editLayer.getSource().getFeatures()[1];
        // New point should have added snapping distance (use toFixed to ignore micro differences)
        expect(JSON.stringify(coordToFixed(newPoint.getGeometry().getCoordinates(), 5)))
            .to.equal(
              JSON.stringify(coordToFixed(win.map.getCoordinateFromPixel([500 + snapDistance, 500]), 5)));
      });
    });
  });
});
  