// "use client";

// import { useState } from "react";

// type NotionCreateResponse = {
//   preferredUrl?: string;
//   publicUrl?: string;
//   url?: string;
//   error?: string;
// };

// export default function QuestionsGenerator() {
//   const [company, setCompany] = useState("");
//   const [questions, setQuestions] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [markdown, setMarkdown] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [status, setStatus] = useState("Idle");
//   const [notionUrl, setNotionUrl] = useState("");

//   async function generate() {
//     setError(null);
//     setNotionUrl("");
//     setLoading(true);
//     setStatus("Generating answers...");

//     try {
//       const res = await fetch("/api/generate-answers", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ companyName: company, questions }),
//       });

//       if (!res.ok) {
//         throw new Error(await res.text());
//       }

//       const data = await res.json();
//       const generated = (data.markdown || "").trim();
//       if (!generated) {
//         throw new Error("No content generated");
//       }

//       setMarkdown(generated);
//       setStatus("Answers generated. Ready to create Notion page.");
//     } catch (err: unknown) {
//       setStatus("Failed.");
//       setError(err instanceof Error ? err.message : "Generation failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function publishToNotion() {
//     if (!markdown) {
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setStatus("Creating Notion page...");

//     try {
//       const res = await fetch("/api/create-notion", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           title: `${company || "Interview"} - Question Answers`,
//           markdown,
//         }),
//       });

//       const data = (await res.json()) as NotionCreateResponse;
//       if (!res.ok) {
//         throw new Error(data.error || "Failed to publish");
//       }

//       const url = data.preferredUrl || data.publicUrl || data.url || "";
//       if (!url) {
//         throw new Error("Notion URL not returned from API.");
//       }

//       setNotionUrl(url);
//       setStatus("Completed. Notion page created successfully.");
//     } catch (err: unknown) {
//       setStatus("Failed.");
//       setError(err instanceof Error ? err.message : "Failed to publish");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "48rem", margin: "0 auto" }}>
//       <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#161616" }}>Question-Based Generation</h2>

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
//         <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>Company</label>
//         <input
//           style={{
//             width: "100%",
//             color: "#161616",
//             padding: "0.625rem",
//             borderRadius: "6px",
//             border: "1px solid rgba(0,0,0,0.1)",
//             fontSize: "0.95rem",
//             backgroundColor: "#fff",
//           }}
//           value={company}
//           onChange={(e) => setCompany(e.target.value)}
//           placeholder="Company name"
//         />
//       </div>

//       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//         <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>
//           Questions (one per line)
//         </label>
//         <textarea
//           style={{
//             width: "100%",
//             color: "#161616",
//             height: "160px",
//             padding: "0.625rem",
//             borderRadius: "6px",
//             border: "1px solid rgba(0,0,0,0.1)",
//             fontSize: "0.95rem",
//             fontFamily: "inherit",
//             resize: "none",
//             backgroundColor: "#fff",
//           }}
//           value={questions}
//           onChange={(e) => setQuestions(e.target.value)}
//           placeholder="Paste or type interview questions here"
//         />
//       </div>

//       <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
//         <button
//           onClick={generate}
//           disabled={loading || !questions.trim()}
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: "0.6rem",
//             padding: "0.7rem 1rem",
//             borderRadius: "10px",
//             fontWeight: 700,
//             cursor: loading ? "not-allowed" : "pointer",
//             border: "none",
//             background: loading ? "rgba(16, 185, 129, 0.3)" : "linear-gradient(90deg, #10b981, #059669)",
//             color: "#FEFACD",
//             opacity: loading ? 0.85 : 1,
//           }}
//         >
//           {loading ? "Working..." : "Generate Answers"}
//         </button>

//         {markdown && (
//           <button
//             onClick={publishToNotion}
//             disabled={loading}
//             style={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: "0.6rem",
//               padding: "0.7rem 1rem",
//               borderRadius: "10px",
//               fontWeight: 700,
//               cursor: loading ? "not-allowed" : "pointer",
//               border: "none",
//               background: "linear-gradient(90deg, #F1E194, #fff6d8)",
//               color: "#5B0E14",
//               opacity: loading ? 0.85 : 1,
//             }}
//           >
//             Create Notion Page
//           </button>
//         )}
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

//       {markdown && (
//         <div style={{ marginTop: "1rem" }}>
//           <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem", color: "#161616" }}>Preview</h3>
//           <div
//             style={{
//               marginTop: "0.5rem",
//               padding: "1rem",
//               background: "rgba(255,255,255,0.6)",
//               border: "1px solid rgba(0,0,0,0.1)",
//               borderRadius: "8px",
//               maxHeight: "384px",
//               overflowY: "auto",
//             }}
//           >
//             <pre
//               style={{
//                 whiteSpace: "pre-wrap",
//                 wordWrap: "break-word",
//                 fontFamily: "monospace",
//                 fontSize: "0.875rem",
//                 color: "#161616",
//               }}
//             >
//               {markdown}
//             </pre>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";
import { useState, useRef } from "react";
import { SheetEntry, INTERVIEW_ROUNDS, DOCUMENT_TYPES } from "../components/sheetEntryModal";
import { logToSheet } from "../../src/lib/sheets";

type NotionCreateResponse = { preferredUrl?: string; publicUrl?: string; url?: string; error?: string };
type TaskProps = { startTask: (cancelFn: () => void) => void; updateTask: (p: number, s: string) => void; endTask: () => void };

export default function QuestionsGenerator({ startTask, updateTask, endTask }: TaskProps) {
  const [company, setCompany] = useState("");
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notionUrl, setNotionUrl] = useState("");
  const [jobId, setJobId] = useState("");
  const [interviewRound, setInterviewRound] = useState(INTERVIEW_ROUNDS[0]);
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[2]);
  const [createdBy, setCreatedBy] = useState("");
  const cancelledRef = useRef(false);

  async function handleGenerate() {
    if (!questions.trim()) { setError("Questions are required."); return; }
    if (!company.trim()) { setError("Company name is required."); return; }
    if (!jobId.trim()) { setError("Job ID is required."); return; }
    if (!createdBy.trim()) { setError("Created By is required."); return; }
    const sheetEntry: SheetEntry = { jobId: jobId.trim(), companyName: company.trim(), interviewRound, documentType, createdBy: createdBy.trim(), service: "Questions" };
    setError(null);
    setNotionUrl("");
    setLoading(true);
    cancelledRef.current = false;
    startTask(() => { cancelledRef.current = true; });

    const companyToUse = company;

    try {
      // Step 1: Generate answers
      updateTask(20, "Generating answers…");
      const resGen = await fetch("/api/generate-answers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: companyToUse, questions }),
      });
      if (cancelledRef.current) return;
      if (!resGen.ok) throw new Error(await resGen.text());
      const dataGen = await resGen.json();
      const markdown = (dataGen.markdown || "").trim();
      if (!markdown) throw new Error("No content generated");

      // Step 2: Create Notion page with toggle per question
      updateTask(65, "Creating Notion page…");
      const notionTitle = `${companyToUse || "Interview"} - Question Answers`;
      const resNotion = await fetch("/api/create-notion-toggles", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: notionTitle, markdown, headingLevel: "###" }),
      });
      if (cancelledRef.current) return;
      const dataNotion = (await resNotion.json()) as NotionCreateResponse;
      if (!resNotion.ok) throw new Error(dataNotion.error || "Failed to create Notion page");
      const url = dataNotion.preferredUrl || dataNotion.publicUrl || dataNotion.url || "";
      if (!url) throw new Error("No URL returned");
      setNotionUrl(url);

      // Step 3: Log to sheet
      updateTask(92, "Logging to Google Sheet…");
      try { await logToSheet({ ...sheetEntry, companyName: companyToUse, refDocumentTitle: notionTitle, refDocLink: url }); } catch { }

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
      <h2 style={headingStyle}>Question-Based Generation</h2>

      <Field label="Company">
        <input style={inputStyle} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
      </Field>
      <Field label="Questions (one per line)">
        <textarea
          style={{ ...inputStyle, height: "150px", resize: "none", fontFamily: "inherit" }}
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          placeholder="Paste interview questions here"
        />
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
        disabled={loading || !questions.trim()}
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
const btnPrimary = (loading: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", padding: "0.75rem 1.5rem", borderRadius: "10px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", border: "none", background: loading ? "#cbd5e1" : "linear-gradient(135deg, #0284c7, #0ea5e9)", color: "#ffffff", fontSize: "0.95rem", opacity: loading ? 0.7 : 1, boxShadow: loading ? "none" : "0 4px 16px rgba(14,165,233,0.35)", transition: "all 180ms ease" });