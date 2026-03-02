"use client";
import { useState } from "react";

export default function TechStackGenerator() {
  const [company, setCompany] = useState("");
  const [techs, setTechs] = useState("");

  // NEW inputs (because the “above flow” needs them)
  const [jobDescription, setJobDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    setStatus("");

    // ✅ Open a tab immediately (prevents popup blocker)
    const newTab = window.open("about:blank", "_blank");
    if (newTab) {
      newTab.document.title = "Generating Notion Doc…";
      newTab.document.body.innerHTML = `
        <div style="font-family: system-ui; padding: 24px;">
          <h2 style="margin:0 0 8px;">Generating your Notion document…</h2>
          <p style="margin:0; opacity:0.75;">Please keep this tab open.</p>
        </div>`;
    }

    try {
      // 1) Extract topics (UNCHANGED API)
      setStatus("Extracting topics…");
      const companyName = company;
      const techStack = techs;

      const resTopics = await fetch("/api/generate-techstack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, techStack }),
      });
      if (!resTopics.ok) throw new Error(await resTopics.text());
      const dataTopics = await resTopics.json();
      const topics: string[] = dataTopics.topics || [];
      if (!topics.length) throw new Error("No topics extracted");

      // 2) Generate content (UNCHANGED API)
      setStatus("Generating content…");
      const resContent = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics }),
      });
      if (!resContent.ok) throw new Error(await resContent.text());
      const dataContent = await resContent.json();
      const markdown: string = dataContent.markdown || "";
      if (!markdown.trim()) throw new Error("No content generated");

      // 3) Create Notion page (UNCHANGED API)
      setStatus("Creating Notion page…");
      const resNotion = await fetch("/api/create-notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `${companyName} - Interview Prep`, markdown }),
      });
      if (!resNotion.ok) throw new Error(await resNotion.text());
      const dataNotion = await resNotion.json();

      const url = dataNotion.preferredUrl || dataNotion.url || dataNotion.publicUrl || "";
      if (!url) {
        throw new Error(`Notion URL not returned. Response: ${JSON.stringify(dataNotion)}`);
      }

      // ✅ Navigate the already-opened tab
      if (newTab) newTab.location.href = url;
      else window.location.assign(url);
    } catch (err: any) {
      if (newTab) newTab.close();
      setError(err?.message || "Failed to generate Notion page");
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: "40rem",
        margin: "0 auto",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#161616" }}>
        Tech Stacks Based Generation
      </h2>

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
      {loading && status && <div style={{ color: "#5B0E14", fontSize: "0.875rem" }}>{status}</div>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.6rem 1rem",
          borderRadius: "10px",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          border: "none",
          background: loading
            ? "rgba(16, 185, 129, 0.3)"
            : "linear-gradient(90deg, #10b981, #059669)",
          color: "#FEFACD",
          opacity: loading ? 0.85 : 1,
        }}
      >
        {loading ? "Generating Notion Doc…" : "Generate Notion Doc"}
      </button>
    </div>
  );
}