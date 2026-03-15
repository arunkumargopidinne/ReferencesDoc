"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AssignmentGenerator from "./AssignmentGenerator";
import DrilldownGenerator from "./DrilldownGenerator";
import QuestionsGenerator from "./QuestionsGenerator";
import TechStackGenerator from "./TechStackGenerator";

type Mode = "drilldowns" | "assignment" | "techstack" | "questions";

const OPTIONS: Array<{ value: Mode; label: string; desc: string }> = [
  { value: "drilldowns", label: "Drilldowns", desc: "From job descriptions" },
  { value: "assignment", label: "Assignment", desc: "Reference doc generation" },
  { value: "techstack", label: "Tech Stack", desc: "Stack-based generation" },
  { value: "questions", label: "Questions", desc: "Q&A generation" },
];

export type TaskState = {
  running: boolean;
  progress: number;
  step: string;
  cancel: (() => void) | null;
};

const IDLE: TaskState = { running: false, progress: 0, step: "", cancel: null };

export default function Page() {
  const [active, setActive] = useState<Mode>("drilldowns");
  const [pending, setPending] = useState<Mode | null>(null);
  const [task, setTask] = useState<TaskState>(IDLE);
  const [showBlockedToast, setShowBlockedToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTask = useCallback((cancelFn: () => void) => {
    setTask({ running: true, progress: 0, step: "Starting...", cancel: cancelFn });
  }, []);

  const updateTask = useCallback((progress: number, step: string) => {
    setTask((prev) => ({ ...prev, progress, step }));
  }, []);

  const endTask = useCallback(() => {
    setTask((prev) => ({ ...prev, progress: 100, step: "Done" }));
    setTimeout(() => setTask(IDLE), 1000);
  }, []);

  const cancelTask = useCallback(() => {
    task.cancel?.();
    setTask(IDLE);
  }, [task]);

  const handleSelect = (mode: Mode) => {
    if (task.running) {
      setPending(mode);
      setShowBlockedToast(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setShowBlockedToast(false), 2500);
      return;
    }
    setActive(mode);
  };

  useEffect(() => {
    if (!task.running && pending) {
      setActive(pending);
      setPending(null);
    }
  }, [task.running, pending]);

  const taskProps = { startTask, updateTask, endTask };

  return (
    <>
      {task.running && (
        <div style={progressTrackStyle}>
          <div style={{ ...progressFillStyle, width: `${task.progress}%` }} />
        </div>
      )}

      {showBlockedToast && (
        <div style={toastStyle}>
          Task is running. Wait or cancel before switching.
          {pending ? ` Pending: ${pending}` : ""}
        </div>
      )}

      <div className="dash-shell" style={shellStyle}>
        <aside className="dash-sidebar" style={sidebarStyle}>
          <div style={brandStyle}>
            <div style={brandTitleStyle}>Reference Doc Prep Studio</div>
            <div style={brandSubStyle}>Educational Interview Preparation</div>
          </div>

          <nav className="dash-nav" style={navStyle}>
            {OPTIONS.map((option) => {
              const isActive = active === option.value;
              const isLocked = task.running && !isActive;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  disabled={isLocked}
                  style={navItemStyle(isActive, isLocked)}
                >
                  <span style={navItemTitleStyle}>{option.label}</span>
                  <span style={navItemDescStyle}>{option.desc}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="dash-main" style={mainStyle}>
          <header style={headerStyle}>
            <h1 style={headingStyle}>Interview Reference Document Generator</h1>
            <p style={headingSubStyle}>
              Generate structured study documents for drilldowns, assignments,
              tech stacks, and interview questions.
            </p>
          </header>

          {task.running && (
            <div style={taskCardStyle}>
              <div style={taskMetaStyle}>
                <div style={taskLabelStyle}>In Progress</div>
                <div style={taskStepStyle}>{task.step}</div>
              </div>
              <button onClick={cancelTask} style={cancelButtonStyle}>
                Cancel
              </button>
            </div>
          )}

          <section style={panelStyle}>
            {active === "drilldowns" && <DrilldownGenerator {...taskProps} />}
            {active === "assignment" && <AssignmentGenerator {...taskProps} />}
            {active === "techstack" && <TechStackGenerator {...taskProps} />}
            {active === "questions" && <QuestionsGenerator {...taskProps} />}
          </section>
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dash-shell {
            flex-direction: column !important;
          }
          .dash-sidebar {
            width: 100% !important;
            position: static !important;
            border-right: none !important;
            border-bottom: 1px solid #e5e7eb !important;
          }
          .dash-nav {
            flex-direction: row !important;
            overflow-x: auto !important;
          }
          .dash-main {
            padding: 1rem !important;
          }
        }
      `}</style>
    </>
  );
}

const shellStyle: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, #f8fbff 0%, #fdfdfd 45%, #f4f8ee 100%)",
};

const sidebarStyle: React.CSSProperties = {
  width: 260,
  flexShrink: 0,
  position: "sticky",
  top: 0,
  height: "100vh",
  borderRight: "1px solid rgba(15, 23, 42, 0.18)",
  background: "linear-gradient(180deg, #123a6b 0%, #0f2c54 100%)",
  display: "flex",
  flexDirection: "column",
};

const brandStyle: React.CSSProperties = {
  padding: "1.25rem 1rem 1rem",
  borderBottom: "1px solid rgba(226, 232, 240, 0.12)",
};

const brandTitleStyle: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "#f8fafc",
};

const brandSubStyle: React.CSSProperties = {
  marginTop: 4,
  fontSize: "0.78rem",
  color: "#cbd5e1",
};

const navStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  padding: "0.9rem",
};

const navItemStyle = (active: boolean, locked: boolean): React.CSSProperties => ({
  textAlign: "left",
  borderRadius: 10,
  border: active ? "1px solid rgba(191, 219, 254, 0.75)" : "1px solid rgba(226, 232, 240, 0.12)",
  background: active
    ? "linear-gradient(135deg, rgba(59, 130, 246, 0.38), rgba(14, 165, 233, 0.22))"
    : "rgba(255, 255, 255, 0.05)",
  color: active ? "#f8fafc" : locked ? "rgba(148, 163, 184, 0.55)" : "#e2e8f0",
  padding: "0.7rem 0.8rem",
  cursor: locked ? "not-allowed" : "pointer",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  boxShadow: active ? "0 8px 22px rgba(8, 47, 73, 0.28)" : "none",
});

const navItemTitleStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 700,
};

const navItemDescStyle: React.CSSProperties = {
  fontSize: "0.73rem",
  color: "rgba(226, 232, 240, 0.78)",
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const headerStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.85)",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: "1rem 1.2rem",
};

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.45rem",
  fontWeight: 700,
  color: "#0f172a",
};

const headingSubStyle: React.CSSProperties = {
  margin: "0.35rem 0 0",
  fontSize: "0.9rem",
  color: "#475569",
};

const taskCardStyle: React.CSSProperties = {
  border: "1px solid #dbeafe",
  background: "#f0f9ff",
  borderRadius: 12,
  padding: "0.8rem 1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
};

const taskMetaStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const taskLabelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#0369a1",
  fontWeight: 700,
  textTransform: "uppercase",
};

const taskStepStyle: React.CSSProperties = {
  fontSize: "0.88rem",
  color: "#0f172a",
};

const cancelButtonStyle: React.CSSProperties = {
  border: "1px solid #fca5a5",
  background: "#fff1f2",
  color: "#b91c1c",
  borderRadius: 8,
  padding: "0.45rem 0.8rem",
  cursor: "pointer",
  fontWeight: 600,
};

const panelStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.9)",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: "1.25rem",
};

const progressTrackStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: 4,
  background: "#e2e8f0",
  zIndex: 50,
};

const progressFillStyle: React.CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg,#0284c7,#22c55e)",
  transition: "width 250ms ease",
};

const toastStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 60,
  background: "#1e293b",
  color: "#f8fafc",
  padding: "0.65rem 0.95rem",
  borderRadius: 8,
  fontSize: "0.82rem",
};

