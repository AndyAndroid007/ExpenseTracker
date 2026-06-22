describe('Expense Tracker - Settings Page Flows', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('nav').contains('button', 'Settings').click();
  });

  it('should toggle theme between light and dark mode and apply classes to html element', () => {
    // 1. Click Dark mode button
    cy.get('.visible').contains('button', 'Dark').click();
    cy.get('html').should('have.class', 'dark');

    // 2. Click Light mode button
    cy.get('.visible').contains('button', 'Light').click();
    cy.get('html').should('not.have.class', 'dark');
  });

  it('should display Profile, Appearance, and App sections correctly', () => {
    cy.get('.visible').contains('Profile').should('be.visible');
    cy.get('.visible').contains('Appearance').should('be.visible');
    cy.get('.visible').contains('App').should('be.visible');
    cy.contains('Local only').should('be.visible');
  });
});
