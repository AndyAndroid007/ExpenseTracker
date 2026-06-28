import ProfileSection from './ProfileSection';
import ThemeSection from './ThemeSection';
import AboutSection from './AboutSection';
import NotificationsSection from './NotificationsSection';

export default function SettingsTab() {
  return (
    <div
      /* style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)' }} */
      className="flex-1 overflow-y-auto bg-bg scrollbar-none"
    >
      <div
        /* style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }} */
        className="max-w-[640px] mx-auto py-[clamp(1rem,3vw,1.5rem)] px-[clamp(1rem,4vw,2rem)] flex flex-col gap-md"
      >

        <section>
          <SectionLabel>Profile</SectionLabel>
          <ProfileSection />
        </section>

        <section>
          <SectionLabel>Appearance</SectionLabel>
          <ThemeSection />
        </section>

        <section>
          <SectionLabel>Notifications & Streaks</SectionLabel>
          <NotificationsSection />
        </section>

        <section>
          <SectionLabel>App</SectionLabel>
          <AboutSection />
        </section>

        <footer
          /* style={{ textAlign: 'center', paddingTop: '0.5rem', paddingBottom: '1rem' }} */
          className="text-center pt-2 pb-4"
        >
          <p
            /* style={{ fontSize: '11px', color: 'var(--color-label-tertiary)' }} */
            className="text-[11px] text-label-tertiary"
          >
            © 2026 Spendly Inc. All rights reserved.
          </p>
        </footer>

      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      /* style={{
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--color-label-tertiary)',
        marginBottom: '8px',
        paddingLeft: '4px',
      }} */
      className="text-[11px] font-semibold tracking-[0.06em] uppercase text-label-tertiary mb-2 pl-1"
    >
      {children}
    </p>
  );
}
