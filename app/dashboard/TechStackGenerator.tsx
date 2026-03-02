"use client";

import { useState } from "react";

type NotionCreateResponse = {
  preferredUrl?: string;
  publicUrl?: string;
  url?: string;
  error?: string;
};

export default function TechStackGenerator() {
  const [company, setCompany] = useState("");
  const [techs, setTechs] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState<string | null>(null);
  const [notionUrl, setNotionUrl] = useState("");

  async function handleSubmit() {
    setError(null);
    setNotionUrl("");
    setLoading(true);

    try {
      const companyName = company;
      const techStack = techs;

      setStatus("1/3 Extracting topics from tech stack...");
      const resTopics = await fetch("/api/generate-techstack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, techStack }),
      });

      if (!resTopics.ok) {
        throw new Error(await resTopics.text());
      }

      const dataTopics = await resTopics.json();
      const topics = dataTopics.topics || [];
      if (!topics.length) {
        throw new Error("No topics extracted");
      }

      setStatus("2/3 Generating content...");
      const resContent = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics }),
      });

      if (!resContent.ok) {
        throw new Error(await resContent.text());
      }

      const dataContent = await resContent.json();
      const markdown: string = (dataContent.markdown || "").trim();
      if (!markdown) {
        throw new Error("No content generated");
      }

      setStatus("3/3 Creating Notion page...");
      const resNotion = await fetch("/api/create-notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `${companyName} - Interview Prep`, markdown }),
      });

      const dataNotion = (await resNotion.json()) as NotionCreateResponse;
      if (!resNotion.ok) {
        throw new Error(dataNotion.error || "Failed to create Notion page");
      }

      const url = dataNotion.preferredUrl || dataNotion.publicUrl || dataNotion.url || "";
      if (!url) {
        throw new Error("Notion URL not returned from API");
      }

      setNotionUrl(url);
      setStatus("Completed. Notion page created successfully.");
    } catch (err: unknown) {
      setStatus("Failed.");
      setError(err instanceof Error ? err.message : "Failed to generate Notion page");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: "48rem",
        margin: "0 auto",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#161616" }}>
        Tech Stacks Based Generation
      </h2>

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
        <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>
          Company
        </label>
        <input
          style={{
            width: "100%",
            color: "#161616",
            backgroundColor: "#fff",
            padding: "0.625rem",
            borderRadius: "6px",
            border: "1px solid rgba(0,0,0,0.1)",
            fontSize: "0.95rem",
          }}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company name"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>
          Tech stacks (comma separated)
        </label>
        <input
          style={{
            width: "100%",
            color: "#161616",
            backgroundColor: "#fff",
            padding: "0.625rem",
            borderRadius: "6px",
            border: "1px solid rgba(0,0,0,0.1)",
            fontSize: "0.95rem",
          }}
          value={techs}
          onChange={(e) => setTechs(e.target.value)}
          placeholder="React, Node.js, PostgreSQL"
        />
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

      <button
        onClick={handleSubmit}
        disabled={loading || !techs.trim()}
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
          background: loading
            ? "rgba(16, 185, 129, 0.3)"
            : "linear-gradient(90deg, #10b981, #059669)",
          color: "#FEFACD",
          opacity: loading ? 0.85 : 1,
        }}
      >
        {loading ? "Working..." : "Generate Notion Doc"}
      </button>
    </div>
  );
}
