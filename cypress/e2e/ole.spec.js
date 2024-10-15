describe("OLE", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should initialize OLE toolbar", () => {
    cy.get("#ole-toolbar").should("exist");
  });
});
