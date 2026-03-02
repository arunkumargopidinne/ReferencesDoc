"use client";
import { useState } from 'react';
import AssignmentGenerator from './AssignmentGenerator';
import TechStackGenerator from './TechStackGenerator';
import QuestionsGenerator from './QuestionsGenerator';
import Drilldown from './DrilldownGenerator';

export default function Page() {
  const [active, setActive] = useState<'drilldowns' | 'assignment' | 'techstack' | 'questions'>('drilldowns');

  const options: Array<{ value: 'drilldowns' | 'assignment' | 'techstack' | 'questions'; label: string }> = [
    { value: 'drilldowns', label: 'Based on Drilldowns' },
    { value: 'assignment', label: 'Assignment Reference Doc Generation' },
    { value: 'techstack', label: 'Tech Stacks Based Generation' },
    { value: 'questions', label: 'Based on Questions' },
  ];

  function renderContent() {
    switch (active) {
      case 'drilldowns':
        return <Drilldown />;
      case 'assignment':
        return <AssignmentGenerator />;
      case 'techstack':
        return <TechStackGenerator />;
      case 'questions':
        return <QuestionsGenerator />;
      default:
        return null;
    }
  }

  return (
    <main style={{
      padding: '2rem',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FEFACD 0%, #fffef6 100%)',
    }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '12px',
          padding: '1rem',
        }}>
          <label htmlFor="generator-select" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#161616' }}>
            Select Generation Mode
          </label>
          <select
            id="generator-select"
            value={active}
            onChange={(e) => setActive(e.target.value as 'drilldowns' | 'assignment' | 'techstack' | 'questions')}
            style={{
              width: '100%',
              maxWidth: '28rem',
              padding: '0.625rem',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.12)',
              fontSize: '0.95rem',
              color: '#161616',
              backgroundColor: '#fff',
            }}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.56)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '12px',
          padding: '1rem',
        }}>
          {renderContent()}
        </div>
      </div>
    </main>
  );
}
