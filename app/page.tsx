import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #FEFACD 0%, #fffef6 100%)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '42rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '3rem',
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(6px)',
        borderRadius: '16px',
        padding: '3rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}>
        <div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #5B0E14, #5F4A8B)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
          }}>Interview Prep</h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#6b6b6b',
            lineHeight: 1.6,
          }}>
            Prepare for your interviews with AI-generated answers, reference docs, and tech-stack guides. Export everything to Notion.
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Link href="/dashboard" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.875rem 1.75rem',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: 'pointer',
            background: 'linear-gradient(90deg, #5B0E14, #5F4A8B)',
            color: '#FEFACD',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(91,14,20,0.18)',
            fontSize: '1rem',
            transition: 'all 180ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)', e.currentTarget.style.boxShadow = '0 18px 48px rgba(91,14,20,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none', e.currentTarget.style.boxShadow = '0 6px 20px rgba(91,14,20,0.18)')}
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
