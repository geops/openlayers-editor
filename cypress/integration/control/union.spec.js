const FORCE = {force: true}

describe('Union control', function () {
  beforeEach(function () {
      cy.visit('/');
  
      // Draw polygon (click on map container, double click to finish drawing)
      cy.get('[title="Draw Polygon"]').click();
      cy.get('.ol-overlaycontainer').click(500, 200, FORCE);
      cy.get('.ol-overlaycontainer').click(600, 400, FORCE);
      cy.get('.ol-overlaycontainer').dblclick(400, 400, FORCE);

      // Draw overlapping polygon (click on map container, double click to finish drawing)
      cy.get('.ol-overlaycontainer').click(600, 200, FORCE);
      cy.get('.ol-overlaycontainer').click(550, 350, FORCE);
      cy.get('.ol-overlaycontainer').dblclick(400, 300, FORCE);
    });

  it('should unite two overlapping polygons to one polygon with correct nodes', function () {
    cy.window().then((win) => {
      // Activate union tool (click on toolbar)
      cy.get('.ole-control-union').click().then(() => {
        // Click on map canvas to select polygon for unison
        cy.get('.ol-overlaycontainer').click(500, 210, FORCE);
      }).then(() => {
        cy.wait(1000); // Wait to avoid zoom on map due to load races
        // Click on map canvas to select overlapping polygon
        cy.get('.ol-overlaycontainer').click(580, 220, FORCE)
        cy.wait(1000).then(() => {
          // New (united) polygon should have 9 nodes (10 coordinates)
          const united = win.editLayer.getSource().getFeatures()[0]
          expect(united.getGeometry().getCoordinates()[0].length).to.equal(10)
        });
      });
    });
  });
});