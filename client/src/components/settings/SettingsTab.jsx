import ProfileSection from './ProfileSection';
import ThemeSection from './ThemeSection';
import AboutSection from './AboutSection';

export default function SettingsTab() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)' }}>
      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>

        <section>
          <SectionLabel>Profile</SectionLabel>
          <ProfileSection />
        </section>

        <section>
          <SectionLabel>Appearance</SectionLabel>
          <ThemeSection />
        </section>

        <section>
          <SectionLabel>App</SectionLabel>
          <AboutSection />
        </section>

        <footer style={{ textAlign: 'center', paddingTop: '0.5rem', paddingBottom: '1rem' }}>
          <p style={{ fontSize: '11px', color: 'var(--color-label-tertiary)' }}>
            © 2026 Spendly Inc. All rights reserved.
          </p>
        </footer>

      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--color-label-tertiary)',
      marginBottom: '8px',
      paddingLeft: '4px',
    }}>
      {children}
    </p>
  );
}
