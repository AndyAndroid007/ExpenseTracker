describe('Expense Tracker - Overall End-to-End User Flow', () => {
  it('should complete a full user lifecycle across Log, History, Insights, and Settings tabs', () => {
    cy.visit('/');

    // === 1. Log tab: Log an expense with unrecognized merchant ===
    cy.get('nav').contains('button', 'Log').click();
    cy.get('textarea[placeholder*="Swiggy"]').type('200 on blinkit today{enter}');

    // Verify warning notice shows up
    cy.contains('New merchant detected ("blinkit")').should('be.visible');

    // Correct the category to Food
    cy.contains('button', 'Edit').last().click();
    cy.get('select').select('Food');
    cy.contains('button', 'Save').click();

    // Verify confirm message
    cy.contains('✅ Logged ₹200 for Food.').should('be.visible');

    // === 2. History tab: Verify listing and Summary stats ===
    cy.get('nav').contains('button', 'History').click();

    cy.get('.visible').contains('Total spent').parent().contains('₹200').should('be.visible');
    cy.get('.visible').contains('Transactions').parent().contains('1').should('be.visible');
    cy.get('.visible').contains('Top category').parent().contains('Food').should('be.visible');

    // Verify individual row
    cy.get('.visible').contains('Food').should('be.visible');
    cy.get('.visible').contains('₹200').should('be.visible');

    // === 3. Insights tab: Verify period summary and breakdowns ===
    cy.get('nav').contains('button', 'Insights').click();

    cy.get('.visible').contains('Total spent').parent().contains('₹200').should('be.visible');
    cy.get('.visible').contains('Total spent').parent().contains('Top: Food').should('be.visible');
    cy.get('.visible').contains('Food').should('be.visible');

    // === 4. Settings tab: Toggle theme and check persistence ===
    cy.get('nav').contains('button', 'Settings').click();

    // Toggle Dark Mode
    cy.get('.visible').contains('button', 'Dark').click();
    cy.get('html').should('have.class', 'dark');

    // Toggle Light Mode
    cy.get('.visible').contains('button', 'Light').click();
    cy.get('html').should('not.have.class', 'dark');
  });
});
