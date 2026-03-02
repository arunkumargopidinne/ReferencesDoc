"use client";
import { useState } from 'react';
import DashboardSidebar from '../components/DashboardSidebar';
import AssignmentGenerator from './AssignmentGenerator';
import TechStackGenerator from './TechStackGenerator';
import QuestionsGenerator from './QuestionsGenerator';
import Drilldown from './DrilldownGenerator';

export default function Page() {
  const [active, setActive] = useState('drilldowns');

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
      display: 'flex',
      gap: '1.5rem',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FEFACD 0%, #fffef6 100%)',
    }}>
      <DashboardSidebar active={active} onSelect={setActive} />
      <div style={{ flex: 1 }}>{renderContent()}</div>
    </main>
  );
}
