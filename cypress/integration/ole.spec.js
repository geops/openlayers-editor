describe('OLE', function () {

  beforeEach(function () {
    cy.visit('/')
  });

  it('should initialize OLE toolbar', function () {
    cy.get('#ole-toolbar').should('exist')
  });

});
