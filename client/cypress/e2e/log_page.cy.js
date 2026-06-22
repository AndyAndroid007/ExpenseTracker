describe('Expense Tracker - Log Page Flows', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('nav').contains('button', 'Log').click();
  });

  it('should route greeting chitchat without showing a confirm card', () => {
    cy.get('textarea[placeholder*="Swiggy"]').type('hello{enter}');
    cy.contains("Hey! 👋 I'm Spendly").should('be.visible');
    cy.contains("Doesn't look like an expense").should('be.visible');
    cy.contains('button', 'Confirm').should('not.exist');
  });

  it('should automatically log a no-spend day without a confirm card', () => {
    cy.get('textarea[placeholder*="Swiggy"]').type('no spend today{enter}');
    cy.contains('No-spend day logged').should('be.visible');
    cy.contains('button', 'Confirm').should('not.exist');
  });

  it('should disable Confirm button when amount is missing, and enable after editing', () => {
    cy.get('textarea[placeholder*="Swiggy"]').type('spent on food{enter}');
    cy.contains('button', 'Confirm').should('be.visible');
    cy.contains('button', 'Confirm').last().should('be.disabled');

    cy.contains('button', 'Edit').last().click();
    cy.contains('button', 'Save').should('be.disabled');

    cy.get('input[type="number"]').type('150');
    cy.contains('button', 'Save').should('not.be.disabled');

    cy.get('input[type="number"]').clear();
    cy.contains('button', 'Save').should('be.disabled');

    cy.get('input[type="number"]').type('150');
    cy.contains('button', 'Save').click();

    // Verify logged message (saving from edit form automatically confirms)
    cy.contains('✅ Logged ₹150 for Food.').should('be.visible');

    // Navigate to History tab
    cy.get('nav').contains('button', 'History').click();

    // Verify the transaction displays with parsed category "Food" as title
    cy.get('.visible').contains('Food').should('be.visible');
    cy.get('.visible').contains('Expense').should('be.visible');
    cy.get('.visible').contains('₹150').should('be.visible');
  });

  it('should disable Confirm button when amount is 0, and enable after editing to positive value', () => {
    cy.get('textarea[placeholder*="Swiggy"]').type('lunch 0rs{enter}');
    cy.contains('button', 'Confirm').last().should('be.disabled');

    cy.contains('button', 'Edit').last().click();
    cy.contains('button', 'Save').should('be.disabled');

    cy.get('input[type="number"]').clear().type('80');
    cy.contains('button', 'Save').should('not.be.disabled');
    cy.contains('button', 'Save').click();

    // Verify logged message
    cy.contains('✅ Logged ₹80 for Food.').should('be.visible');
  });

  it('should display warning notice for unrecognized merchant and log category correction', () => {
    // Use an explicit date "yesterday" so that confidence is high and it bypasses Gemini,
    // thereby keeping the category as "General" and triggering the unrecognized merchant notice.
    cy.get('textarea[placeholder*="Swiggy"]').type('200 on blinkit yesterday{enter}');

    // Verify ConfirmCard is shown with inline warning notice
    cy.contains('New merchant detected ("blinkit")').should('be.visible');

    cy.contains('button', 'Edit').last().click();

    cy.get('select').select('Food');
    cy.contains('button', 'Save').click();

    // Verify logged message
    cy.contains('✅ Logged ₹200 for Food.').should('be.visible');
  });

  it('should reject future date logging with a sarcastic message', () => {
    cy.get('textarea[placeholder*="Swiggy"]').type('Uber 250 tomorrow{enter}');
    cy.contains("Nice try, time traveler!").should('be.visible');
    cy.contains('button', 'Confirm').should('not.exist');
  });

  it('should parse day before yesterday and grammatical variations correctly with appropriate labels', () => {
    // 1. Day before yesterday -> should show "Day before yesterday" label
    cy.get('textarea[placeholder*="Swiggy"]').type('Swiggy 150 day before yesterday{enter}');
    cy.contains('button', 'Confirm').should('be.visible');
    cy.contains('Day before yesterday').should('be.visible');
    cy.contains('button', 'Confirm').last().click();
    cy.contains('✅ Logged ₹150 for Food.').should('be.visible');

    // 2. Grammatical variation: "3 day before yesterday" -> should show "4 days ago" label
    cy.get('textarea[placeholder*="Swiggy"]').type('Swiggy 200 3 day before yesterday{enter}');
    cy.contains('button', 'Confirm').should('be.visible');
    cy.contains('4 days ago').should('be.visible');
    cy.contains('button', 'Confirm').last().click();
    cy.contains('✅ Logged ₹200 for Food.').should('be.visible');
  });

  it('should allow editing date in the edit card form and block future dates with a sarcastic warning', () => {
    // Type an expense for today
    cy.get('textarea[placeholder*="Swiggy"]').type('Uber 100 today{enter}');
    cy.contains('button', 'Confirm').should('be.visible');
    cy.contains('Today').should('be.visible');

    // Click Edit
    cy.contains('button', 'Edit').last().click();

    // Change date to a future date (e.g. tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    // Enter future date
    cy.get('input[type="date"]').clear().type(tomorrowStr);
    cy.contains('button', 'Save').click();

    // Verify sarcastic warning is shown in the form alert
    cy.contains("Nice try, time traveler!").should('be.visible');

    // Change date to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    cy.get('input[type="date"]').clear().type(yesterdayStr);
    cy.contains('button', 'Save').click();

    // Verify it is successfully saved and confirmed
    cy.contains('✅ Logged ₹100 for Transport.').should('be.visible');
  });
});
