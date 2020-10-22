describe('OLE', function () {
  beforeEach(function () {
    cy.visit('/');
   });

  it('should delete node on polygon node single click', function () {
    cy.window().then((win) => {
      const spy = cy.spy(win.modify.selectModify, 'addFeatureLayerAssociation_');
      console.log(win.modify);
      cy.get('[title="Draw Polygon"]').click();
      cy.get('.ol-overlaycontainer').click(100, 100, {force: true});
      cy.get('.ol-overlaycontainer').click(100, 150, {force: true});
      cy.get('.ol-overlaycontainer').click(150, 170, {force: true});
      cy.get('.ol-overlaycontainer').dblclick(200, 100, {force: true});
      cy.get('.ole-control-modify').click();
      cy.get('.ol-overlaycontainer').dblclick(100, 100, {force: true});
      cy.get('.ol-overlaycontainer').click(102, 152, {force: true});
      cy.get('.ol-overlaycontainer').click(100, 100, {force: true}).then(() => {
        // Check that no features from the overlay are mistakenly selected
        expect(spy.withArgs(spy.args[0][0], null)).to.not.be.called
      });
    });
  });
});
