describe('Draw control', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show draw control for points', () => {
    cy.get('.ole-control-draw')
      .first()
      .should('have.attr', 'title', 'Draw Point');
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
