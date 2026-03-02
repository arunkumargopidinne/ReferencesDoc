"use client";

import { useState } from "react";

type NotionCreateResponse = {
  preferredUrl?: string;
  publicUrl?: string;
  url?: string;
  error?: string;
};

export default function QuestionsGenerator() {
  const [company, setCompany] = useState("");
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Idle");
  const [notionUrl, setNotionUrl] = useState("");

  async function generate() {
    setError(null);
    setNotionUrl("");
    setLoading(true);
    setStatus("Generating answers...");

    try {
      const res = await fetch("/api/generate-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: company, questions }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      const generated = (data.markdown || "").trim();
      if (!generated) {
        throw new Error("No content generated");
      }

      setMarkdown(generated);
      setStatus("Answers generated. Ready to create Notion page.");
    } catch (err: unknown) {
      setStatus("Failed.");
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function publishToNotion() {
    if (!markdown) {
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Creating Notion page...");

    try {
      const res = await fetch("/api/create-notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${company || "Interview"} - Question Answers`,
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
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#161616" }}>Question-Based Generation</h2>

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
            color: "#161616",
            padding: "0.625rem",
            borderRadius: "6px",
            border: "1px solid rgba(0,0,0,0.1)",
            fontSize: "0.95rem",
            backgroundColor: "#fff",
          }}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company name"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>
          Questions (one per line)
        </label>
        <textarea
          style={{
            width: "100%",
            color: "#161616",
            height: "160px",
            padding: "0.625rem",
            borderRadius: "6px",
            border: "1px solid rgba(0,0,0,0.1)",
            fontSize: "0.95rem",
            fontFamily: "inherit",
            resize: "none",
            backgroundColor: "#fff",
          }}
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          placeholder="Paste or type interview questions here"
        />
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={generate}
          disabled={loading || !questions.trim()}
          style={{
            display: "inline-flex",
            alignItems: "center",
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
          {loading ? "Working..." : "Generate Answers"}
        </button>

        {markdown && (
          <button
            onClick={publishToNotion}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
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
