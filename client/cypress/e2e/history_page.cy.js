describe('Expense Tracker - History Page Flows', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display empty state message when no entries are logged', () => {
    cy.get('nav').contains('button', 'History').click();
    cy.get('.visible').contains('No entries found').should('be.visible');
    cy.get('.visible').contains('Try logging an expense in the Chat tab!').should('be.visible');
  });

  it('should list transactions in correct categories, with correct styles and stats in Summary Grid', () => {
    // 1. Log a Food expense
    cy.get('textarea[placeholder*="Swiggy"]').type('120 on lunch{enter}');
    cy.contains('button', 'Confirm').last().click();
    cy.contains('✅ Logged').should('be.visible');

    // 2. Log a Transport expense
    cy.get('textarea[placeholder*="Swiggy"]').type('230 taxi today{enter}');
    cy.contains('button', 'Confirm').last().click();
    cy.contains('✅ Logged').should('be.visible');

    // 3. Log a no-spend day (this is a save_day type with null amount)
    cy.get('textarea[placeholder*="Swiggy"]').type('no spend today{enter}');
    cy.contains('No-spend day logged').should('be.visible');

    // 4. Navigate to History tab
    cy.get('nav').contains('button', 'History').click();

    // 5. Verify the Summary Grid stats
    // Total spent = 120 + 230 = ₹350
    cy.get('.visible').contains('Total spent').parent().contains('₹350').should('be.visible');
    // Transactions count = 2
    cy.get('.visible').contains('Transactions').parent().contains('2').should('be.visible');
    // No-spend days count = 1
    cy.get('.visible').contains('No-spend days').parent().contains('1').should('be.visible');
    // Top category = Transport (spent 230 vs Food 120)
    cy.get('.visible').contains('Top category').parent().contains('Transport').should('be.visible');

    // 6. Verify individual rows in the list
    cy.get('.visible').contains('Food').should('be.visible');
    cy.get('.visible').contains('Transport').should('be.visible');
    cy.get('.visible').contains('No-spend day').should('be.visible');
    cy.get('.visible').contains('₹120').should('be.visible');
    cy.get('.visible').contains('₹230').should('be.visible');
  });

  it('should allow switching between different range controls', () => {
    cy.get('nav').contains('button', 'History').click();

    // Check default select range is "This week"
    cy.get('.visible').contains('button', 'This week').should('be.visible');

    // Switch range to "This month"
    cy.get('.visible').contains('button', 'This week').click();
    cy.get('.visible').contains('button', 'This month').click();
    cy.get('.visible').contains('button', 'This month').should('be.visible');

    // Switch range to "This year"
    cy.get('.visible').contains('button', 'This month').click();
    cy.get('.visible').contains('button', 'This year').click();
    cy.get('.visible').contains('button', 'This year').should('be.visible');
  });
});
