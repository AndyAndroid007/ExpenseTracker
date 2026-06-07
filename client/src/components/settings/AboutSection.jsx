import { IconInfoCircle, IconHelp } from '@tabler/icons-react';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.875rem 1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--color-blue-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)',
          flexShrink: 0,
        }}>
          <Icon size={16} strokeWidth={2} />
        </div>
        <span style={{ fontSize: '0.9375rem', color: 'var(--color-label-primary)' }}>{label}</span>
      </div>
      <span style={{ fontSize: '0.8125rem', color: 'var(--color-label-tertiary)' }}>{value}</span>
    </div>
  );
}

export default function AboutSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{
        background: 'var(--color-surface)',
        border: '0.5px solid var(--color-separator)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}>
        <InfoRow icon={IconInfoCircle} label="Version" value="1.0.0" />
        <div style={{ height: '0.5px', background: 'var(--color-separator)', margin: '0 1.25rem' }} />
        <InfoRow icon={IconHelp} label="Help & Support" value="support@spendly.app" />
      </div>

      <div style={{
        background: 'var(--color-surface)',
        border: '0.5px solid var(--color-separator)',
        borderRadius: 'var(--radius-card)',
        padding: '1rem 1.25rem',
      }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-label-secondary)', lineHeight: 1.6, margin: 0 }}>
          Spendly helps you build better spending habits through daily tracking and streak-based accountability. Your data is stored locally on this device.
        </p>
      </div>
    </div>
  );
}
