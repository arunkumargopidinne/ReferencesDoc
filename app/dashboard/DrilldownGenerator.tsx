"use client";
import { useState, useRef } from "react";
import { SheetEntry, INTERVIEW_ROUNDS, DOCUMENT_TYPES } from "../components/sheetEntryModal";
import { logToSheet } from "../../src/lib/sheets";

type NotionCreateResponse = { preferredUrl?: string; publicUrl?: string; url?: string; error?: string };
type TaskProps = { startTask: (cancelFn: () => void) => void; updateTask: (p: number, s: string) => void; endTask: () => void };

export default function DrilldownGenerator({ startTask, updateTask, endTask }: TaskProps) {
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notionUrl, setNotionUrl] = useState("");
  const [jobId, setJobId] = useState("");
  const [interviewRound, setInterviewRound] = useState(INTERVIEW_ROUNDS[0]);
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[2]);
  const [createdBy, setCreatedBy] = useState("");
  const cancelledRef = useRef(false);

  async function handleGenerate() {
    if (!jobDescription.trim()) { setError("Job description is required."); return; }
    if (!companyName.trim()) { setError("Company name is required."); return; }
    if (!jobId.trim()) { setError("Job ID is required."); return; }
    if (!createdBy.trim()) { setError("Created By is required."); return; }
    const sheetEntry: SheetEntry = { jobId: jobId.trim(), companyName: companyName.trim(), interviewRound, documentType, createdBy: createdBy.trim(), service: "Drilldowns" };
    setError(null);
    setNotionUrl("");
    setLoading(true);
    cancelledRef.current = false;
    startTask(() => { cancelledRef.current = true; });
    const company = companyName;
    try {
      updateTask(10, "Extracting topics…");
      const resTopics = await fetch("/api/extract-topics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyName: company, jobDescription, techStack }) });
      if (cancelledRef.current) return;
      if (!resTopics.ok) throw new Error(await resTopics.text());
      const dataTopics = await resTopics.json();
      const topics = dataTopics.topics || [];
      if (!topics.length) throw new Error("No topics extracted");

      updateTask(40, "Generating content…");
      const resContent = await fetch("/api/generate-content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topics }) });
      if (cancelledRef.current) return;
      if (!resContent.ok) throw new Error(await resContent.text());
      const dataContent = await resContent.json();
      const markdown = (dataContent.markdown || "").trim();
      if (!markdown) throw new Error("No content generated");

      updateTask(75, "Creating Notion page…");
      const notionTitle = `${company} Reference Document`;
      const resNotion = await fetch("/api/create-notion-toggles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: notionTitle, markdown, headingLevel: "##" }) });
      if (cancelledRef.current) return;
      const dataNotion = (await resNotion.json()) as NotionCreateResponse;
      if (!resNotion.ok) throw new Error(dataNotion.error || "Failed");
      const url = dataNotion.preferredUrl || dataNotion.publicUrl || dataNotion.url || "";
      if (!url) throw new Error("No URL returned");
      setNotionUrl(url);

      updateTask(92, "Logging to Google Sheet…");
      try { await logToSheet({ ...sheetEntry, companyName: company, refDocumentTitle: notionTitle, refDocLink: url }); } catch { }
      endTask();
    } catch (err: unknown) {
      if (!cancelledRef.current) setError(err instanceof Error ? err.message : "Failed");
      endTask();
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "48rem", margin: "0 auto" }}>
      <h2 style={headingStyle}>Drilldown - Job Description Input</h2>
      <Field label="Company"><input style={inputStyle} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" /></Field>
      <Field label="Job Description / Questions"><textarea style={{ ...inputStyle, height: "150px", resize: "none", fontFamily: "inherit" }} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste JD or drilldown questions" /></Field>
      <Field label="Tech Stack"><input style={inputStyle} value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, Node.js, PostgreSQL" /></Field> 
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
      <button onClick={() => void handleGenerate()} disabled={loading} style={btnPrimary(loading)}>
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
