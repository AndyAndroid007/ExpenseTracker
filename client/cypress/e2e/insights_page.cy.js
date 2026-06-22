describe('Expense Tracker - Insights Page Flows', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display empty state message when no entries are logged', () => {
    cy.get('nav').contains('button', 'Insights').click();
    cy.get('.visible').contains('Log at least 3 entries in this period to unlock personalized AI insights!').should('be.visible');
  });

  it('should compute and show aggregate stats, category breakdowns, and handle period switching', () => {
    // 1. Log a Food expense
    cy.get('textarea[placeholder*="Swiggy"]').type('150 on dinner today{enter}');
    cy.contains('button', 'Confirm').last().click();
    cy.contains('✅ Logged').should('be.visible');

    // 2. Log a Transport expense
    cy.get('textarea[placeholder*="Swiggy"]').type('300 taxi today{enter}');
    cy.contains('button', 'Confirm').last().click();
    cy.contains('✅ Logged').should('be.visible');

    // 3. Log a no-spend day
    cy.get('textarea[placeholder*="Swiggy"]').type('no spend today{enter}');
    cy.contains('No-spend day logged').should('be.visible');

    // 4. Navigate to Insights tab
    cy.get('nav').contains('button', 'Insights').click();

    // 5. Check summary cards
    // Total spent = 450
    cy.get('.visible').contains('Total spent').parent().contains('₹450').should('be.visible');
    // Top category in Total Spent subtext = Dinner (Food) or Taxi (Transport). Taxi (300) > Dinner (150).
    cy.get('.visible').contains('Total spent').parent().contains('Top: Transport').should('be.visible');
    // No-spend days count = 1
    cy.get('.visible').contains('No-spend days').parent().contains('1').should('be.visible');

    // 6. Verify breakdown is present and lists Transport & Food
    cy.get('.visible').contains('Transport').should('be.visible');
    cy.get('.visible').contains('Food').should('be.visible');

    // 7. Verify Period Selector switching
    cy.get('.visible').contains('button', 'monthly').click();
    cy.get('.visible').contains('monthly summary').should('be.visible');

    cy.get('.visible').contains('button', 'yearly').click();
    cy.get('.visible').contains('yearly summary').should('be.visible');
  });
});
