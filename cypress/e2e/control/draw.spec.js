describe('Draw control', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show draw control for points', () => {
    cy.get('.ole-control-draw')
      .first()
      .should('have.attr', 'title', 'Draw Point');

    cy.get('.ole-control-draw').first().click();
    cy.get('.ol-viewport').click('center');
    cy.window().then((win) =>
      expect(win.editLayer.getSource().getFeatures().length).to.eq(1),
    );
  });

  it('should show draw control for lines', () => {
    cy.get('.ole-control-draw')
      .eq(1)
      .should('have.attr', 'title', 'Draw LineString');
  });

  it('should show draw control for polygons', () => {
    cy.get('.ole-control-draw')
      .last()
      .should('have.attr', 'title', 'Draw Polygon');
  });
});
