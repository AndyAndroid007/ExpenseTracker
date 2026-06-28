describe('Expense Tracker - Web Push Notifications & Reminders', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('nav').contains('button', 'Settings').click();
  });

  it('should handle granting permission, subscribing, and dispatching a test push notification', () => {
    // Mock Notification API permission grant
    cy.window().then((win) => {
      cy.stub(win.Notification, 'requestPermission').resolves('granted');
      
      // Mock Service Worker pushManager
      if (win.navigator.serviceWorker) {
        const mockReg = {
          pushManager: {
            getSubscription: () => Promise.resolve(null),
            subscribe: () => Promise.resolve({
              endpoint: 'https://fcm.googleapis.com/fcm/send/cypress-mock-device',
              toJSON: () => ({
                endpoint: 'https://fcm.googleapis.com/fcm/send/cypress-mock-device',
                keys: { p256dh: 'mock-p256', auth: 'mock-auth' }
              })
            })
          }
        };
        Object.defineProperty(win.navigator.serviceWorker, 'ready', {
          get: () => Promise.resolve(mockReg),
          configurable: true
        });
      }
    });

    // Verify Notifications & Streaks section exists
    cy.contains('Daily Streak Reminders').should('be.visible');
    cy.contains(/Freezes Available/).should('be.visible');

    // Click Enable button
    cy.contains('button', 'Enable').click();

    // Verify status message and enabled state
    cy.contains('🔥 Reminders enabled!').should('be.visible');
    cy.contains('button', 'Disable').should('be.visible');

    // Click Send Test Push button
    cy.contains('button', 'Send Test Push').click();
    cy.contains(/Test notification dispatched/).should('be.visible');
  });

  it('should gracefully handle browser notification permission denial', () => {
    // Mock Notification API permission denial
    cy.window().then((win) => {
      cy.stub(win.Notification, 'requestPermission').resolves('denied');
    });

    // Click Enable button
    cy.contains('button', 'Enable').click();

    // Verify error message is displayed
    cy.contains('Notification permission was denied.').should('be.visible');
    cy.contains('button', 'Enable').should('be.visible');
  });
});
