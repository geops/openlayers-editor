describe('OLE', function () {

  beforeEach(function () {
    cy.visit('/');
  });

  it('should initialize OLE toolbar', function () {
    cy.visit('/')
    cy.get('#ole-toolbar').should('exist');
  });

  it('should delete node on polygon node single click', function () {
    cy.window().then((win) => {
      const spy = cy.spy(win.modify.selectModify, 'addFeatureLayerAssociation_');
      console.log(spy);
      cy.get('[title="Draw Polygon"]').click();
      cy.get('.ol-overlaycontainer').click(100, 100, {force: true});
      cy.get('.ol-overlaycontainer').click(100, 150, {force: true});
      cy.get('.ol-overlaycontainer').click(150, 170, {force: true});
      cy.get('.ol-overlaycontainer').dblclick(200, 100, {force: true});
      cy.get('.ole-control-modify').click();
      cy.get('.ol-overlaycontainer').dblclick(100, 100, {force: true});
      cy.get('.ol-overlaycontainer').click(102, 152, {force: true});
      cy.get('.ol-overlaycontainer').click(100, 100, {force: true}).then(() => {
        expect(spy.withArgs(spy.args[0][0], null)).to.not.be.called
      });
    });
    // cy.get('[title="Draw Point"]').click();
    // cy.get('.ol-overlaycontainer').click(100, 97, {force: true});
  });

});
