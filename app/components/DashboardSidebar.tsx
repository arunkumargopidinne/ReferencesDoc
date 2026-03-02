"use client";
type Props = { active: string; onSelect: (k: string) => void };
export default function DashboardSidebar({ active, onSelect }: Props) {
  const items = [
    { key: "drilldowns", label: "Based on Drilldowns" },
    { key: "assignment", label: "Assignment reference doc generation" },
    { key: "techstack", label: "Tech stacks based generation" },
    { key: "questions", label: "Based on questions" },
  ];

  return (
    <aside style={{
      width: '256px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.54))',
      borderRight: '1px solid rgba(0,0,0,0.04)',
      padding: '1rem',
      borderRadius: '12px',
      height: 'fit-content',
      position: 'sticky',
      top: '2rem',
    }}>
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: 600,
        marginBottom: '0.75rem',
        color: '#161616',
      }}>Dashboard</h3>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onSelect(it.key)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: active === it.key ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 180ms ease',
              background: active === it.key
                ? 'linear-gradient(90deg, #5B0E14, #5F4A8B)'
                : 'transparent',
              color: active === it.key ? '#FEFACD' : '#161616',
              fontSize: '0.95rem',
              boxShadow: active === it.key ? '0 6px 20px rgba(91,14,20,0.18)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (active !== it.key) {
                e.currentTarget.style.background = 'rgba(91,14,20,0.05)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (active !== it.key) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            {it.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
