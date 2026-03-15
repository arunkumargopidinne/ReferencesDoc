"use client";

import { useRef, useState } from "react";
import {
  DOCUMENT_TYPES,
  INTERVIEW_ROUNDS,
  SheetEntry,
} from "../components/sheetEntryModal";
import { logToSheet } from "../../src/lib/sheets";

type NotionCreateResponse = {
  preferredUrl?: string;
  publicUrl?: string;
  url?: string;
  error?: string;
};

type TaskProps = {
  startTask: (cancelFn: () => void) => void;
  updateTask: (p: number, s: string) => void;
  endTask: () => void;
};

function isPdfFile(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function isTextDocument(file: File) {
  return file.type.startsWith("text/") || /\.(txt|md|markdown)$/i.test(file.name);
}

export default function AssignmentGenerator({
  startTask,
  updateTask,
  endTask,
}: TaskProps) {
  const [company, setCompany] = useState("");
  const [text, setText] = useState("");
  const [frontendTechnologies, setFrontendTechnologies] = useState("");
  const [backendTechnologies, setBackendTechnologies] = useState("");
  const [timeline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notionUrl, setNotionUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  const [jobId, setJobId] = useState("");
  const [interviewRound, setInterviewRound] = useState(INTERVIEW_ROUNDS[0]);
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[2]);
  const [createdBy, setCreatedBy] = useState("");

  const fileRef = useRef<HTMLInputElement | null>(null);
  const cancelledRef = useRef(false);

  async function runAll(assignmentText: string, sheetEntry: SheetEntry) {
    setError(null);
    setNotionUrl("");
    setLoading(true);
    cancelledRef.current = false;
    startTask(() => {
      cancelledRef.current = true;
    });

    const companyToUse = sheetEntry.companyName || company;

    try {
      updateTask(15, "Generating reference document...");
      const resGen = await fetch("/api/generate-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyToUse,
          assignmentText,
          frontendTechnologies,
          backendTechnologies,
          timeline,
        }),
      });
      if (cancelledRef.current) return;

      const dataGen = await resGen.json().catch(() => ({}));
      if (!resGen.ok) {
        throw new Error((dataGen as { error?: string }).error || "Generation failed");
      }

      const markdown =
        typeof (dataGen as { markdown?: string }).markdown === "string"
          ? (dataGen as { markdown: string }).markdown.trim()
          : "";

      if (!markdown) {
        throw new Error("No content generated");
      }

      updateTask(65, "Creating Notion page...");
      const notionTitle = `${companyToUse || "Interview"} Assignment Reference Document`;
      const resNotion = await fetch("/api/create-notion-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: notionTitle, markdown }),
      });
      if (cancelledRef.current) return;

      const dataNotion = (await resNotion.json()) as NotionCreateResponse;
      if (!resNotion.ok) {
        throw new Error(dataNotion.error || "Failed to create Notion page");
      }

      const url = dataNotion.preferredUrl || dataNotion.publicUrl || dataNotion.url || "";
      if (!url) {
        throw new Error("No URL returned from Notion");
      }
      setNotionUrl(url);

      updateTask(92, "Logging to Google Sheet...");
      try {
        await logToSheet({
          ...sheetEntry,
          companyName: companyToUse,
          refDocumentTitle: notionTitle,
          refDocLink: url,
        });
      } catch {
        // non-fatal
      }

      endTask();
    } catch (err: unknown) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : "Failed");
      }
      endTask();
    } finally {
      setLoading(false);
    }
  }

  async function extractFromPdf(file: File) {
    setError(null);
    setLoading(true);
    cancelledRef.current = false;
    startTask(() => {
      cancelledRef.current = true;
    });

    try {
      updateTask(15, "Extracting text from PDF...");
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/extract-pdf-text", { method: "POST", body: fd });
      if (cancelledRef.current) return;

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || "Failed to extract PDF");
      }

      const extracted =
        typeof (data as { text?: string }).text === "string"
          ? (data as { text: string }).text.trim()
          : "";

      if (!extracted) {
        throw new Error("No text found in PDF");
      }

      setText(extracted);
      endTask();
    } catch (err: unknown) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : "Failed");
      }
      endTask();
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleSelectedFile(file: File) {
    setError(null);
    setSelectedFileName(file.name);

    if (isPdfFile(file)) {
      void extractFromPdf(file);
      return;
    }

    if (isTextDocument(file)) {
      file
        .text()
        .then((t) => setText(t.trim()))
        .catch(() => setError("Failed to read file"));
      return;
    }

    setError("Upload a PDF, TXT, or MD file.");
    setSelectedFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <div
        className="assignment-shell"
        style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "48rem", margin: "0 auto", width: "100%" }}
      >
      <h2 style={headingStyle}>Assignment Reference Doc</h2>

      <Field label="Company">
        <input
          style={inputStyle}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company name"
        />
      </Field>

      <Field label="Upload document (optional)">
        <input
          ref={fileRef}
          id="assignment-upload"
          type="file"
          accept=".pdf,.txt,.md,.markdown,text/plain,text/markdown,application/pdf"
          disabled={loading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            handleSelectedFile(file);
          }}
          style={{ display: "none" }}
        />
        <label
          htmlFor="assignment-upload"
          className="assignment-upload-zone"
          style={uploadZoneStyle(dragActive, loading)}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!loading) setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!loading) setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (loading) return;
            const file = e.dataTransfer.files?.[0];
            if (file) handleSelectedFile(file);
          }}
        >
          <UploadIcon />
          <div style={uploadTitleStyle}>
            <strong>Choose a file</strong> or drag it here.
          </div>
          <div style={uploadHintStyle}>PDF / TXT / MD - text extracted automatically</div>
          {selectedFileName ? (
            <div style={uploadFileNameStyle}>{selectedFileName}</div>
          ) : null}
        </label>
      </Field>

      <Field label="Assignment text">
        <textarea
          style={{ ...inputStyle, height: "150px", resize: "none", fontFamily: "inherit" }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste assignment text, or upload a file above"
        />
      </Field>

      <div className="assignment-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <Field label="Frontend Technologies (optional and override)">
          <input
            style={inputStyle}
            value={frontendTechnologies}
            onChange={(e) => setFrontendTechnologies(e.target.value)}
            placeholder="React, Vue, Angular"
          />
        </Field>
        <Field label="Backend Technologies (optional and override)">
          <input
            style={inputStyle}
            value={backendTechnologies}
            onChange={(e) => setBackendTechnologies(e.target.value)}
            placeholder="Node.js, Java, Python"
          />
        </Field>
      </div>

      <div style={{ borderTop: "1px solid rgba(15,23,42,0.1)", paddingTop: "1rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "0.75rem" }}>
          Sheet Details - all fields required
        </div>
        <div className="assignment-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Field label="Job ID *">
            <input style={inputStyle} value={jobId} onChange={(e) => setJobId(e.target.value)} placeholder="e.g. JOB-001" />
          </Field>
          <Field label="Created By *">
            <input style={inputStyle} value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} placeholder="Your name" />
          </Field>
          <Field label="Interview Round *">
            <select style={{ ...inputStyle, cursor: "pointer" }} value={interviewRound} onChange={(e) => setInterviewRound(e.target.value)}>
              {INTERVIEW_ROUNDS.map((round) => (
                <option key={round} value={round} style={{ color: "#161616", background: "#fff" }}>
                  {round}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Document Type *">
            <select style={{ ...inputStyle, cursor: "pointer" }} value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
              {DOCUMENT_TYPES.map((docType) => (
                <option key={docType} value={docType} style={{ color: "#161616", background: "#fff" }}>
                  {docType}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {notionUrl && <NotionLink url={notionUrl} />}

      <button
        className="assignment-submit"
        onClick={() => {
          if (!text.trim()) {
            setError("Add assignment text first.");
            return;
          }
          if (!company.trim()) {
            setError("Company name is required.");
            return;
          }
          if (!jobId.trim()) {
            setError("Job ID is required.");
            return;
          }
          if (!createdBy.trim()) {
            setError("Created By is required.");
            return;
          }

          setError(null);
          void runAll(text.trim(), {
            jobId: jobId.trim(),
            companyName: company.trim(),
            interviewRound,
            documentType,
            createdBy: createdBy.trim(),
            service: "Assignment",
          });
        }}
        disabled={loading || !text.trim()}
        style={btnPrimary(loading)}
      >
        {loading ? <LoadingDots /> : "Generate Notion Doc"}
      </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .assignment-shell {
            gap: 1rem !important;
          }

          .assignment-grid {
            grid-template-columns: 1fr !important;
          }

          .assignment-upload-zone {
            min-height: 200px !important;
            padding: 1.5rem 1rem !important;
          }

          .assignment-submit {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
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

function UploadIcon() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      aria-hidden="true"
      style={{ color: "#87a7b3" }}
    >
      <path
        d="M36 12V38"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M24 28L36 40L48 28"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 47V57H53V47"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const headingStyle: React.CSSProperties = {
  fontSize: "1.4rem",
  fontWeight: 700,
  color: "#0f172a",
  margin: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#475569",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontFamily: "monospace",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.875rem",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
};

const uploadTitleStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  color: "#27485a",
  textAlign: "center",
  lineHeight: 1.4,
};

const uploadHintStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "#64808c",
  fontFamily: "monospace",
  textAlign: "center",
};

const uploadFileNameStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "#33586a",
  fontWeight: 600,
  textAlign: "center",
  wordBreak: "break-word",
};

const errorStyle: React.CSSProperties = {
  color: "#b91c1c",
  fontSize: "0.85rem",
  fontFamily: "monospace",
};

const btnPrimary = (loading: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.6rem",
  padding: "0.75rem 1.5rem",
  borderRadius: "10px",
  fontWeight: 700,
  cursor: loading ? "not-allowed" : "pointer",
  border: "none",
  background: loading ? "#cbd5e1" : "linear-gradient(135deg, #0284c7, #0ea5e9)",
  color: "#ffffff",
  fontSize: "0.95rem",
  opacity: loading ? 0.7 : 1,
  boxShadow: loading ? "none" : "0 4px 16px rgba(14,165,233,0.35)",
  transition: "all 180ms ease",
});

const uploadZoneStyle = (
  dragActive: boolean,
  loading: boolean
): React.CSSProperties => ({
  width: "100%",
  minHeight: "240px",
  borderRadius: "6px",
  border: dragActive
    ? "2px dashed #87a7b3"
    : "2px dashed rgba(135, 167, 179, 0.75)",
  background: dragActive ? "#d9e9ef" : "#d6e5eb",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.85rem",
  padding: "2rem 1.25rem",
  cursor: loading ? "not-allowed" : "pointer",
  transition: "background 180ms ease, border-color 180ms ease, transform 180ms ease",
  opacity: loading ? 0.75 : 1,
  boxSizing: "border-box",
});

