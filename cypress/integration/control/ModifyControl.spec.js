const FORCE = {force: true}

describe('ModifyControl', function () {
  beforeEach(function () {
    cy.visit('/');

    // Draw polygon
    cy.get('[title="Draw Polygon"]').click();
    cy.get('.ol-overlaycontainer').click(100, 100, FORCE);
    cy.get('.ol-overlaycontainer').click(100, 150, FORCE);
    cy.get('.ol-overlaycontainer').click(150, 170, FORCE);
    cy.get('.ol-overlaycontainer').dblclick(200, 100, FORCE);

    // Draw line
    cy.get('[title="Draw LineString"]').click();
    cy.get('.ol-overlaycontainer').click(400, 350, FORCE);
    cy.get('.ol-overlaycontainer').click(270, 344, FORCE);
    cy.get('.ol-overlaycontainer').dblclick(200, 450, FORCE);
  });

  it('should correctly handle node deletion', function () {
    cy.window().then((win) => {
      // Spy on selectModify.addFeatureLayerAssociation_, called when a feature is selected
      const omitFeatureSelectSpy = cy.spy(win.modify.selectModify, 'addFeatureLayerAssociation_');
      let selectedFeaturesArray = [];
      // Select polygon
      cy.get('.ole-control-modify').click();
      cy.get('.ol-overlaycontainer').dblclick(100, 100, FORCE).then(() => {
        selectedFeaturesArray = win.modify.selectModify.getFeatures().getArray();
        // Check if only one feature is selected
        expect(selectedFeaturesArray.length).to.equal(1);
        // Verify the polygon has 4 nodes (5 coordinates)
        expect(selectedFeaturesArray[0].getGeometry().getCoordinates()[0].length).to.equal(5);
      });
      // Click & delete a node
      cy.get('.ol-overlaycontainer').click(102, 152, FORCE).then(() => {
        // Verify one polygon node was deleted on click (3 nodes, 4 coordinates)
        expect(selectedFeaturesArray[0].getGeometry().getCoordinates()[0].length).to.equal(4);
      });
      // Click another node
      cy.get('.ol-overlaycontainer').click(100, 100, FORCE).then(() => {
        // Verify no further node was deleted on click (because polygon minimum number nodes is 3)
        expect(selectedFeaturesArray[0].getGeometry().getCoordinates()[0].length).to.equal(4);
        // Check that no features from the overlay are mistakenly selected
        expect(omitFeatureSelectSpy.withArgs(omitFeatureSelectSpy.args[0][0], null)).to.not.be.called
      });

      // Select line
      cy.get('.ol-overlaycontainer').dblclick(270, 344, FORCE).then(() => {
        selectedFeaturesArray = win.modify.selectModify.getFeatures().getArray();
        // Check if only one feature is selected
        expect(selectedFeaturesArray.length).to.equal(1);
        // Verify the line has 3 nodes (3 coordinates)
        expect(selectedFeaturesArray[0].getGeometry().getCoordinates().length).to.equal(3);
      });
      // Click & delete a node
      cy.get('.ol-overlaycontainer').click(270, 344, FORCE).then(() => {
        // Verify one line node was deleted on click (2 nodes, 2 coordinates)
        expect(selectedFeaturesArray[0].getGeometry().getCoordinates().length).to.equal(2);
      });
      // Click another node
      cy.get('.ol-overlaycontainer').click(400, 350, FORCE).then(() => {
        // Verify no further node was deleted on click (because polygon minimum number nodes is 2)
        expect(selectedFeaturesArray[0].getGeometry().getCoordinates().length).to.equal(2);
        // Check that no features from the overlay are mistakenly selected
        expect(omitFeatureSelectSpy.withArgs(omitFeatureSelectSpy.args[0][0], null)).to.not.be.called
      });
    });
  });
});
