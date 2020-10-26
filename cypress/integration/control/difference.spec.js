const FORCE = {force: true}

describe('Difference control', function () {
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

  it('should subtract overlapping polygons and result in the correct multipolygon', function () {
    cy.window().then((win) => {
      // Activate union tool (click on toolbar)
      cy.get('.ole-control-difference').click().then(() => {
        // Click on map canvas to select polygon for subtraction
        cy.get('.ol-overlaycontainer').click(500, 210, FORCE);
      }).then(() => {
        cy.wait(1000); // Wait to avoid zoom on map due to load races
        // Click on map canvas to select polygon to subtract
        cy.get('.ol-overlaycontainer').click(580, 220, FORCE)
        cy.wait(1000).then(() => {
          const united = win.editLayer.getSource().getFeatures()[0]
          // Should result in a multipolygon (thus have two coordinate arrays)
          expect(united.getGeometry().getCoordinates().length).to.equal(2)
          // First polygon should result in a triangle (3 nodes, 4 coordinates)
          expect(united.getGeometry().getCoordinates()[0][0].length).to.equal(4)
          // Second polygon should have 5 nodes (6 coordinates)
          expect(united.getGeometry().getCoordinates()[1][0].length).to.equal(6)
        });
      });
    });
  });
});