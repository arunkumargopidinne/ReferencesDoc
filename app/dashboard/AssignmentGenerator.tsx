"use client";

import { useRef, useState } from "react";

type NotionCreateResponse = {
  preferredUrl?: string;
  publicUrl?: string;
  url?: string;
  error?: string;
};

function isPdfFile(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function isTextDocument(file: File) {
  return file.type.startsWith("text/") || /\.(txt|md|markdown)$/i.test(file.name);
}

export default function AssignmentGenerator() {
  const [company, setCompany] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notionUrl, setNotionUrl] = useState("");

  const fileRef = useRef<HTMLInputElement | null>(null);

  async function runGenerate(assignmentText: string) {
    setError(null);
    setNotionUrl("");
    setMarkdown(null);
    setStatus("Generating reference document...");
    setLoading(true);

    try {
      const res = await fetch("/api/generate-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: company, assignmentText }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data && typeof data === "object" && "error" in data && typeof data.error === "string"
            ? data.error
            : "Generation failed";
        throw new Error(message);
      }

      const generated =
        data && typeof data === "object" && "markdown" in data && typeof data.markdown === "string"
          ? data.markdown
          : "";

      if (!generated.trim()) {
        throw new Error("No content generated");
      }

      setMarkdown(generated);
      setStatus("Reference document is ready. Create Notion page when ready.");
    } catch (err: unknown) {
      setStatus("Failed.");
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function extractFromPdf(file: File) {
    setError(null);
    setStatus("1/2 Extracting text from PDF...");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/extract-pdf-text", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data && typeof data === "object" && "error" in data && typeof data.error === "string"
            ? data.error
            : "Failed to extract PDF text";
        throw new Error(message);
      }

      if (data && typeof data === "object" && "warning" in data && typeof data.warning === "string") {
        setError(data.warning);
      }

      const extracted =
        data && typeof data === "object" && "text" in data && typeof data.text === "string"
          ? data.text.trim()
          : "";

      setText(extracted);

      if (extracted) {
        setStatus("2/2 Text extracted. Generating reference document...");
        await runGenerate(extracted);
      } else {
        setStatus("No readable text extracted from PDF.");
      }
    } catch (err: unknown) {
      setStatus("Failed.");
      setError(err instanceof Error ? err.message : "Failed to extract PDF text");
    } finally {
      setLoading(false);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }

  async function extractFromTextDocument(file: File) {
    setError(null);
    setStatus("1/2 Reading uploaded document...");
    setLoading(true);

    try {
      const content = (await file.text()).trim();
      if (!content) {
        throw new Error("No readable text found in the uploaded document.");
      }

      setText(content);
      setStatus("2/2 Text extracted. Generating reference document...");
      await runGenerate(content);
    } catch (err: unknown) {
      setStatus("Failed.");
      setError(
        err instanceof Error ? err.message : "Failed to read uploaded document"
      );
    } finally {
      setLoading(false);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }

  async function handleDocumentUpload(file: File) {
    if (isPdfFile(file)) {
      await extractFromPdf(file);
      return;
    }

    if (isTextDocument(file)) {
      await extractFromTextDocument(file);
      return;
    }

    setStatus("Failed.");
    setError("Unsupported file type. Upload PDF, TXT, or MD.");
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  async function generate() {
    const assignmentText = text.trim();
    if (!assignmentText) {
      setError("Please add assignment text first.");
      return;
    }

    await runGenerate(assignmentText);
  }

  async function publishToNotion() {
    if (!markdown) {
      return;
    }

    setError(null);
    setStatus("Creating Notion page...");
    setLoading(true);

    try {
      const res = await fetch("/api/create-notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${company || "Interview"} - Assignment Reference`,
          markdown,
        }),
      });

      const data = (await res.json()) as NotionCreateResponse;
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish");
      }

      const url = data.preferredUrl || data.publicUrl || data.url || "";
      if (!url) {
        throw new Error("Notion URL not returned from API.");
      }

      setNotionUrl(url);
      setStatus("Completed. Notion page created successfully.");
    } catch (err: unknown) {
      setStatus("Failed.");
      setError(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "48rem", margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#161616" }}>Assignment Reference Doc</h2>

      <div
        aria-live="polite"
        style={{
          minHeight: "2.5rem",
          display: "flex",
          alignItems: "center",
          padding: "0.625rem 0.75rem",
          borderRadius: "8px",
          border: "1px solid rgba(0,0,0,0.08)",
          background: "rgba(255,255,255,0.78)",
          color: "#5B0E14",
          fontSize: "0.9rem",
        }}
      >
        <span style={{ fontWeight: 700, marginRight: "0.4rem" }}>Status:</span>
        <span>{status}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>Company</label>
        <input
          style={{
            width: "100%",
            padding: "0.625rem",
            borderRadius: "6px",
            border: "1px solid rgba(0,0,0,0.1)",
            fontSize: "0.95rem",
            color: "#161616",
            backgroundColor: "#fff",
          }}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company name"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>
          Upload document (optional)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.md,.markdown,text/plain,text/markdown,application/pdf"
          disabled={loading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              void handleDocumentUpload(f);
            }
          }}
        />
        <div style={{ fontSize: "0.8rem", opacity: 0.75, color: "#161616" }}>
          Upload PDF/TXT/MD. We extract text immediately and start generation automatically.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>
          Assignment text / paste excerpt
        </label>
        <textarea
          style={{
            width: "100%",
            height: "160px",
            padding: "0.625rem",
            borderRadius: "6px",
            border: "1px solid rgba(0,0,0,0.1)",
            fontSize: "0.95rem",
            fontFamily: "inherit",
            resize: "none",
            color: "#161616",
            backgroundColor: "#fff",
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste assignment or extract from PDF"
        />
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => void generate()}
          disabled={loading || !text.trim()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            padding: "0.7rem 1rem",
            borderRadius: "10px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            border: "none",
            background: loading ? "rgba(16, 185, 129, 0.3)" : "linear-gradient(90deg, #10b981, #059669)",
            color: "#FEFACD",
            opacity: loading ? 0.85 : 1,
          }}
        >
          {loading ? "Working..." : "Generate Reference Doc"}
        </button>

        {markdown && (
          <button
            onClick={() => void publishToNotion()}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              padding: "0.7rem 1rem",
              borderRadius: "10px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
              background: "linear-gradient(90deg, #F1E194, #fff6d8)",
              color: "#5B0E14",
              opacity: loading ? 0.85 : 1,
            }}
          >
            Create Notion Page
          </button>
        )}
      </div>

      {error && <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</div>}

      {notionUrl && (
        <a
          href={notionUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            width: "fit-content",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#5B0E14",
            padding: "0.55rem 0.85rem",
            borderRadius: "8px",
            border: "1px solid rgba(91,14,20,0.24)",
            background: "rgba(255,255,255,0.78)",
          }}
        >
          Open Created Notion Page
        </a>
      )}

      {markdown && (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem", color: "#161616" }}>Preview</h3>

          <div
            style={{
              marginTop: "0.5rem",
              padding: "1rem",
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "8px",
              maxHeight: "384px",
              overflowY: "auto",
            }}
          >
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                fontFamily: "monospace",
                fontSize: "0.875rem",
                color: "#161616",
              }}
            >
              {markdown}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
