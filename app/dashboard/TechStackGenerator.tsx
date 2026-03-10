// "use client";

// import { useState } from "react";

// type NotionCreateResponse = {
//   preferredUrl?: string;
//   publicUrl?: string;
//   url?: string;
//   error?: string;
// };

// export default function TechStackGenerator() {
//   const [company, setCompany] = useState("");
//   const [techs, setTechs] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState("Idle");
//   const [error, setError] = useState<string | null>(null);
//   const [notionUrl, setNotionUrl] = useState("");

//   async function handleSubmit() {
//     setError(null);
//     setNotionUrl("");
//     setLoading(true);

//     try {
//       const companyName = company;
//       const techStack = techs;

//       setStatus("1/3 Extracting topics from tech stack...");
//       const resTopics = await fetch("/api/generate-techstack", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ companyName, techStack }),
//       });

//       if (!resTopics.ok) {
//         throw new Error(await resTopics.text());
//       }

//       const dataTopics = await resTopics.json();
//       const topics = dataTopics.topics || [];
//       if (!topics.length) {
//         throw new Error("No topics extracted");
//       }

//       setStatus("2/3 Generating content...");
//       const resContent = await fetch("/api/generate-content", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ topics }),
//       });

//       if (!resContent.ok) {
//         throw new Error(await resContent.text());
//       }

//       const dataContent = await resContent.json();
//       const markdown: string = (dataContent.markdown || "").trim();
//       if (!markdown) {
//         throw new Error("No content generated");
//       }

//       setStatus("3/3 Creating Notion page...");
//       const resNotion = await fetch("/api/create-notion", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ title: `${companyName} - Interview Prep`, markdown }),
//       });

//       const dataNotion = (await resNotion.json()) as NotionCreateResponse;
//       if (!resNotion.ok) {
//         throw new Error(dataNotion.error || "Failed to create Notion page");
//       }

//       const url = dataNotion.preferredUrl || dataNotion.publicUrl || dataNotion.url || "";
//       if (!url) {
//         throw new Error("Notion URL not returned from API");
//       }

//       setNotionUrl(url);
//       setStatus("Completed. Notion page created successfully.");
//     } catch (err: unknown) {
//       setStatus("Failed.");
//       setError(err instanceof Error ? err.message : "Failed to generate Notion page");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         gap: "1rem",
//         maxWidth: "48rem",
//         margin: "0 auto",
//       }}
//     >
//       <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#161616" }}>
//         Tech Stacks Based Generation
//       </h2>

//       <div
//         aria-live="polite"
//         style={{
//           minHeight: "2.5rem",
//           display: "flex",
//           alignItems: "center",
//           padding: "0.625rem 0.75rem",
//           borderRadius: "8px",
//           border: "1px solid rgba(0,0,0,0.08)",
//           background: "rgba(255,255,255,0.78)",
//           color: "#5B0E14",
//           fontSize: "0.9rem",
//         }}
//       >
//         <span style={{ fontWeight: 700, marginRight: "0.4rem" }}>Status:</span>
//         <span>{status}</span>
//       </div>

//       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//         <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>
//           Company
//         </label>
//         <input
//           style={{
//             width: "100%",
//             color: "#161616",
//             backgroundColor: "#fff",
//             padding: "0.625rem",
//             borderRadius: "6px",
//             border: "1px solid rgba(0,0,0,0.1)",
//             fontSize: "0.95rem",
//           }}
//           value={company}
//           onChange={(e) => setCompany(e.target.value)}
//           placeholder="Company name"
//         />
//       </div>

//       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//         <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>
//           Tech stacks (comma separated)
//         </label>
//         <input
//           style={{
//             width: "100%",
//             color: "#161616",
//             backgroundColor: "#fff",
//             padding: "0.625rem",
//             borderRadius: "6px",
//             border: "1px solid rgba(0,0,0,0.1)",
//             fontSize: "0.95rem",
//           }}
//           value={techs}
//           onChange={(e) => setTechs(e.target.value)}
//           placeholder="React, Node.js, PostgreSQL"
//         />
//       </div>

//       {error && <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</div>}

//       {notionUrl && (
//         <a
//           href={notionUrl}
//           target="_blank"
//           rel="noreferrer"
//           style={{
//             width: "fit-content",
//             textDecoration: "none",
//             fontSize: "0.9rem",
//             fontWeight: 600,
//             color: "#5B0E14",
//             padding: "0.55rem 0.85rem",
//             borderRadius: "8px",
//             border: "1px solid rgba(91,14,20,0.24)",
//             background: "rgba(255,255,255,0.78)",
//           }}
//         >
//           Open Created Notion Page
//         </a>
//       )}

//       <button
//         onClick={handleSubmit}
//         disabled={loading || !techs.trim()}
//         style={{
//           display: "inline-flex",
//           alignItems: "center",
//           justifyContent: "center",
//           gap: "0.6rem",
//           padding: "0.7rem 1rem",
//           borderRadius: "10px",
//           fontWeight: 700,
//           cursor: loading ? "not-allowed" : "pointer",
//           border: "none",
//           background: loading
//             ? "rgba(16, 185, 129, 0.3)"
//             : "linear-gradient(90deg, #10b981, #059669)",
//           color: "#FEFACD",
//           opacity: loading ? 0.85 : 1,
//         }}
//       >
//         {loading ? "Working..." : "Generate Notion Doc"}
//       </button>
//     </div>
//   );
// }


"use client";
import { useState, useRef } from "react";
import { SheetEntry, INTERVIEW_ROUNDS, DOCUMENT_TYPES } from "../components/sheetEntryModal";
import { logToSheet } from "../../src/lib/sheets";

type NotionCreateResponse = { preferredUrl?: string; publicUrl?: string; url?: string; error?: string };
type TaskProps = { startTask: (cancelFn: () => void) => void; updateTask: (progress: number, step: string) => void; endTask: () => void };

export default function TechStackGenerator({ startTask, updateTask, endTask }: TaskProps) {
  const [company, setCompany] = useState("");
  const [techs, setTechs] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notionUrl, setNotionUrl] = useState("");
  const [jobId, setJobId] = useState("");
  const [interviewRound, setInterviewRound] = useState(INTERVIEW_ROUNDS[0]);
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[2]);
  const [createdBy, setCreatedBy] = useState("");
  const cancelledRef = useRef(false);

  async function handleGenerate() {
    if (!techs.trim()) { setError("Tech stack is required."); return; }
    if (!company.trim()) { setError("Company name is required."); return; }
    if (!jobId.trim()) { setError("Job ID is required."); return; }
    if (!createdBy.trim()) { setError("Created By is required."); return; }
    const sheetEntry: SheetEntry = { jobId: jobId.trim(), companyName: company.trim(), interviewRound, documentType, createdBy: createdBy.trim(), service: "TechStack" };
    setError(null);
    setNotionUrl("");
    setLoading(true);
    cancelledRef.current = false;
    startTask(() => { cancelledRef.current = true; });

    const companyName = company;

    try {
      updateTask(10, "Extracting topics from tech stack…");
      const resTopics = await fetch("/api/generate-techstack", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, techStack: techs }),
      });
      if (cancelledRef.current) return;
      if (!resTopics.ok) throw new Error(await resTopics.text());
      const dataTopics = await resTopics.json();
      const topics = dataTopics.topics || [];
      if (!topics.length) throw new Error("No topics extracted");

      updateTask(40, "Generating content…");
      const resContent = await fetch("/api/generate-content", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics, mode: "techstack" }),
      });
      if (cancelledRef.current) return;
      if (!resContent.ok) throw new Error(await resContent.text());
      const dataContent = await resContent.json();
      const markdown: string = (dataContent.markdown || "").trim();
      if (!markdown) throw new Error("No content generated");

      updateTask(75, "Creating Notion page…");
      const notionTitle = `${companyName} - Tech Stack Prep`;
      const resNotion = await fetch("/api/create-notion-toggles", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: notionTitle, markdown, headingLevel: "###" }),
      });
      if (cancelledRef.current) return;
      const dataNotion = (await resNotion.json()) as NotionCreateResponse;
      if (!resNotion.ok) throw new Error(dataNotion.error || "Failed to create Notion page");
      const url = dataNotion.preferredUrl || dataNotion.publicUrl || dataNotion.url || "";
      if (!url) throw new Error("Notion URL not returned");
      setNotionUrl(url);

      updateTask(92, "Logging to Google Sheet…");
      try { await logToSheet({ ...sheetEntry, companyName, refDocumentTitle: notionTitle, refDocLink: url }); } catch { }

      endTask();
    } catch (err: unknown) {
      if (!cancelledRef.current) setError(err instanceof Error ? err.message : "Failed");
      endTask();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "48rem", margin: "0 auto" }}>
      <h2 style={headingStyle}>Tech Stack Based Generation</h2>

      <Field label="Company">
        <input style={inputStyle} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
      </Field>
      <Field label="Tech stacks (comma separated)">
        <input style={inputStyle} value={techs} onChange={(e) => setTechs(e.target.value)} placeholder="React, Node.js, PostgreSQL" />
      </Field>

      <div style={{ borderTop: "1px solid rgba(15,23,42,0.1)", paddingTop: "1rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "0.75rem" }}>
          Sheet Details - all fields required
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Field label="Job ID *">
            <input style={inputStyle} value={jobId} onChange={(e) => setJobId(e.target.value)} placeholder="e.g. JOB-001" />
          </Field>
          <Field label="Created By *">
            <input style={inputStyle} value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} placeholder="Your name" />
          </Field>
          <Field label="Interview Round *">
            <select style={{ ...inputStyle, cursor: "pointer" }} value={interviewRound} onChange={(e) => setInterviewRound(e.target.value)}>
              {INTERVIEW_ROUNDS.map((r) => <option key={r} value={r} style={{ color: "#161616", background: "#fff" }}>{r}</option>)}
            </select>
          </Field>
          <Field label="Document Type *">
            <select style={{ ...inputStyle, cursor: "pointer" }} value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
              {DOCUMENT_TYPES.map((d) => <option key={d} value={d} style={{ color: "#161616", background: "#fff" }}>{d}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {notionUrl && <NotionLink url={notionUrl} />}

      <button
        onClick={() => void handleGenerate()}
        disabled={loading || !techs.trim()}
        style={btnPrimary(loading)}
      >
        {loading ? <LoadingDots /> : "Generate Notion Doc"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}><label style={labelStyle}>{label}</label>{children}</div>;
}
function NotionLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{
        width: "fit-content",
        textDecoration: "none",
        fontSize: "0.875rem",
        fontWeight: 600,
        color: "#0f172a",
        padding: "0.5rem 1rem",
        borderRadius: "8px",
        border: "1px solid #bfdbfe",
        background: "#eff6ff",
        fontFamily: "monospace",
      }}
    >
      Open Notion Page
    </a>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#0ea5e9",
          animation: "pulse 1s infinite",
        }}
      />
      Working...
    </span>
  );
}

const headingStyle: React.CSSProperties = { fontSize: "1.4rem", fontWeight: 700, color: "#0f172a", margin: 0 };
const labelStyle: React.CSSProperties = { fontSize: "0.75rem", fontWeight: 600, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.7rem 0.875rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#0f172a", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" };
const errorStyle: React.CSSProperties = { color: "#b91c1c", fontSize: "0.85rem", fontFamily: "monospace" };
const btnPrimary = (loading: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", padding: "0.75rem 1.5rem", borderRadius: "10px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", border: "none", background: loading ? "#cbd5e1" : "linear-gradient(135deg, #0284c7, #0ea5e9)", color: "#ffffff", fontSize: "0.95rem", opacity: loading ? 0.7 : 1, boxShadow: loading ? "none" : "0 4px 16px rgba(14,165,233,0.35)", transition: "all 180ms ease" })
