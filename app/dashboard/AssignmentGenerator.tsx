// // // ✅ Updated Client Component: AssignmentGenerator.tsx
// // // Adds: PDF upload → server-side extract text → fills textarea automatically

// // "use client";
// // import { useRef, useState } from "react";

// // export default function AssignmentGenerator() {
// //   const [company, setCompany] = useState("");
// //   const [text, setText] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [status, setStatus] = useState<string>("");
// //   const [markdown, setMarkdown] = useState<string | null>(null);
// //   const [error, setError] = useState<string | null>(null);

// //   const fileRef = useRef<HTMLInputElement | null>(null);

// //   async function extractFromPdf(file: File) {
// //     setError(null);
// //     setStatus("Extracting text from PDF…");
// //     setLoading(true);

// //     try {
// //       const fd = new FormData();
// //       fd.append("file", file);

// //       const res = await fetch("/api/extract-pdf-text", {
// //         method: "POST",
// //         body: fd,
// //       });

// //       if (!res.ok) throw new Error(await res.text());
// //       const data = await res.json();

// //       const extracted = (data?.text || "").trim();
// //       if (!extracted) throw new Error("No readable text found in this PDF.");

// //       // Put extracted text into textarea (append or replace — choose one)
// //       setText(extracted);
// //     } catch (err: any) {
// //       setError(err?.message || "Failed to extract PDF text");
// //     } finally {
// //       setLoading(false);
// //       setStatus("");
// //       if (fileRef.current) fileRef.current.value = "";
// //     }
// //   }

// //   async function generate() {
// //     setError(null);
// //     setMarkdown(null);
// //     setStatus("Generating reference doc…");
// //     setLoading(true);

// //     try {
// //       const res = await fetch("/api/generate-assignment", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ companyName: company, assignmentText: text }),
// //       });

// //       if (!res.ok) throw new Error(await res.text());
// //       const data = await res.json();
// //       setMarkdown(data.markdown || "");
// //     } catch (err: any) {
// //       setError(err?.message || "Generation failed");
// //     } finally {
// //       setLoading(false);
// //       setStatus("");
// //     }
// //   }

// //   async function publishToNotion() {
// //     if (!markdown) return;

// //     setError(null);
// //     setStatus("Creating Notion page…");
// //     setLoading(true);

// //     // ✅ open tab immediately to avoid popup blocker
// //     const newTab = window.open("about:blank", "_blank");
// //     if (newTab) {
// //       newTab.document.title = "Creating Notion Page…";
// //       newTab.document.body.innerHTML =
// //         `<div style="font-family:system-ui;padding:24px;">
// //           <h2 style="margin:0 0 8px;">Creating your Notion page…</h2>
// //           <p style="margin:0;opacity:.75;">Please keep this tab open.</p>
// //         </div>`;
// //     }

// //     try {
// //       const res = await fetch("/api/create-notion", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ title: `${company} - Assignment Reference`, markdown }),
// //       });

// //       if (!res.ok) throw new Error(await res.text());
// //       const data = await res.json();
// //       const url = data.preferredUrl || data.url || data.publicUrl || "";

// //       if (!url) throw new Error("Notion URL not returned from API.");

// //       if (newTab) newTab.location.href = url;
// //       else window.location.assign(url);
// //     } catch (err: any) {
// //       if (newTab) newTab.close();
// //       setError(err?.message || "Failed to publish");
// //     } finally {
// //       setLoading(false);
// //       setStatus("");
// //     }
// //   }

// //   return (
// //     <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
// //       <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#161616" }}>
// //         Assignment Reference Doc
// //       </h2>

// //       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
// //         <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>Company</label>
// //         <input
// //           style={{
// //             width: "100%",
// //             padding: "0.625rem",
// //             borderRadius: "6px",
// //             border: "1px solid rgba(0,0,0,0.1)",
// //             fontSize: "0.95rem",
// //             transition: "box-shadow 180ms ease",
// //             color: "#161616",
// //             backgroundColor: "#fff",
// //           }}
// //           onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(91, 14, 20, 0.1)")}
// //           onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
// //           value={company}
// //           onChange={(e) => setCompany(e.target.value)}
// //           placeholder="Company name"
// //         />
// //       </div>

// //       {/* ✅ PDF Upload */}
// //       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
// //         <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>
// //           Upload PDF (optional)
// //         </label>
// //         <input
// //           ref={fileRef}
// //           type="file"
// //           accept="application/pdf"
// //           disabled={loading}
// //           onChange={(e) => {
// //             const f = e.target.files?.[0];
// //             if (f) extractFromPdf(f);
// //           }}
// //         />
// //         <div style={{ fontSize: "0.8rem", opacity: 0.75, color: "#161616" }}>
// //           Upload a text-based PDF. (If it’s a scanned image PDF, you’ll need OCR.)
// //         </div>
// //       </div>

// //       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
// //         <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>
// //           Assignment text / paste excerpt
// //         </label>
// //         <textarea
// //           style={{
// //             width: "100%",
// //             height: "160px",
// //             padding: "0.625rem",
// //             borderRadius: "6px",
// //             border: "1px solid rgba(0,0,0,0.1)",
// //             fontSize: "0.95rem",
// //             fontFamily: "inherit",
// //             transition: "box-shadow 180ms ease",
// //             resize: "none",
// //             color: "#161616",
// //             backgroundColor: "#fff",
// //           }}
// //           onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(91, 14, 20, 0.1)")}
// //           onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
// //           value={text}
// //           onChange={(e) => setText(e.target.value)}
// //           placeholder="Paste assignment or extract from PDF"
// //         />
// //       </div>

// //       <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
// //         <button
// //           onClick={generate}
// //           disabled={loading || !text.trim()}
// //           style={{
// //             display: "inline-flex",
// //             alignItems: "center",
// //             gap: "0.6rem",
// //             padding: "0.6rem 1rem",
// //             borderRadius: "10px",
// //             fontWeight: 600,
// //             cursor: loading ? "not-allowed" : "pointer",
// //             border: "none",
// //             background: loading ? "rgba(16, 185, 129, 0.3)" : "linear-gradient(90deg, #10b981, #059669)",
// //             color: "#FEFACD",
// //             boxShadow: loading ? "none" : "0 6px 20px rgba(16,185,129,0.18)",
// //             transition: "all 180ms ease",
// //             opacity: loading ? 0.8 : 1,
// //           }}
// //         >
// //           {loading ? "Working…" : "Generate Reference Doc"}
// //         </button>

// //         {status && <span style={{ fontSize: "0.875rem", color: "#161616" }}>{status}</span>}
// //       </div>

// //       {error && <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</div>}

// //       {markdown && (
// //         <div style={{ marginTop: "1rem" }}>
// //           <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem", color: "#161616" }}>
// //             Preview
// //           </h3>
// //           <div
// //             style={{
// //               marginTop: "0.5rem",
// //               padding: "1rem",
// //               background: "rgba(255,255,255,0.6)",
// //               border: "1px solid rgba(0,0,0,0.1)",
// //               borderRadius: "8px",
// //               maxHeight: "384px",
// //               overflowY: "auto",
// //             }}
// //           >
// //             <pre
// //               style={{
// //                 whiteSpace: "pre-wrap",
// //                 wordWrap: "break-word",
// //                 fontFamily: "monospace",
// //                 fontSize: "0.875rem",
// //                 color: "#161616",
// //               }}
// //             >
// //               {markdown}
// //             </pre>
// //           </div>

// //           <div style={{ marginTop: "0.75rem" }}>
// //             <button
// //               onClick={publishToNotion}
// //               disabled={loading}
// //               style={{
// //                 display: "inline-flex",
// //                 alignItems: "center",
// //                 gap: "0.6rem",
// //                 padding: "0.6rem 1rem",
// //                 borderRadius: "10px",
// //                 fontWeight: 600,
// //                 cursor: loading ? "not-allowed" : "pointer",
// //                 border: "none",
// //                 background: "linear-gradient(90deg, #F1E194, #fff6d8)",
// //                 color: "#5B0E14",
// //                 boxShadow: "0 8px 28px rgba(241,225,148,0.16)",
// //                 transition: "all 180ms ease",
// //                 opacity: loading ? 0.85 : 1,
// //               }}
// //             >
// //               Create Notion Page
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // components/AssignmentGenerator.tsx


// "use client";
// import { useRef, useState } from "react";

// export default function AssignmentGenerator() {
//   const [company, setCompany] = useState("");
//   const [text, setText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState<string>("");
//   const [markdown, setMarkdown] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const fileRef = useRef<HTMLInputElement | null>(null);

//   async function extractFromPdf(file: File) {
//     setError(null);
//     setStatus("Extracting text from PDF…");
//     setLoading(true);

//     try {
//       const fd = new FormData();
//       fd.append("file", file);

//       const res = await fetch("/api/extract-pdf-text", {
//         method: "POST",
//         body: fd,
//       });

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(data?.error || "Failed to extract PDF text");

//       if (data?.warning) {
//         // show warning (scanned pdf case)
//         setError(data.warning);
//       }

//       const extracted = (data?.text || "").trim();
//       if (extracted) {
//         setText(extracted);
//         // automatically kick off generation once the text is available
//         generate();
//       }
//     } catch (err: any) {
//       setError(err?.message || "Failed to extract PDF text");
//     } finally {
//       setLoading(false);
//       setStatus("");
//       if (fileRef.current) fileRef.current.value = "";
//     }
//   }

//   async function generate() {
//     setError(null);
//     setMarkdown(null);
//     setStatus("Generating reference doc…");
//     setLoading(true);

//     try {
//       const res = await fetch("/api/generate-assignment", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ companyName: company, assignmentText: text }),
//       });

//       if (!res.ok) throw new Error(await res.text());
//       const data = await res.json();
//       setMarkdown(data.markdown || "");
//     } catch (err: any) {
//       setError(err?.message || "Generation failed");
//     } finally {
//       setLoading(false);
//       setStatus("");
//     }
//   }

//   async function publishToNotion() {
//     if (!markdown) return;

//     setError(null);
//     setStatus("Creating Notion page…");
//     setLoading(true);

//     // ✅ open tab immediately (prevents popup block)
//     const newTab = window.open("about:blank", "_blank");
//     if (newTab) {
//       newTab.document.title = "Creating Notion Page…";
//       newTab.document.body.innerHTML =
//         `<div style="font-family:system-ui;padding:24px;">
//           <h2 style="margin:0 0 8px;">Creating your Notion page…</h2>
//           <p style="margin:0;opacity:.75;">Please keep this tab open.</p>
//         </div>`;
//     }

//     try {
//       const res = await fetch("/api/create-notion", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ title: `${company} - Assignment Reference`, markdown }),
//       });

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(data?.error || "Failed to publish");

//       const url = data.preferredUrl || data.url || data.publicUrl || "";
//       if (!url) throw new Error("Notion URL not returned from API.");

//       if (newTab) newTab.location.href = url;
//       else window.location.assign(url);
//     } catch (err: any) {
//       if (newTab) newTab.close();
//       setError(err?.message || "Failed to publish");
//     } finally {
//       setLoading(false);
//       setStatus("");
//     }
//   }

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
//       <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#161616" }}>
//         Assignment Reference Doc
//       </h2>

//       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//         <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>Company</label>
//         <input
//           style={{
//             width: "100%",
//             padding: "0.625rem",
//             borderRadius: "6px",
//             border: "1px solid rgba(0,0,0,0.1)",
//             fontSize: "0.95rem",
//             transition: "box-shadow 180ms ease",
//             color: "#161616",
//             backgroundColor: "#fff",
//           }}
//           value={company}
//           onChange={(e) => setCompany(e.target.value)}
//           placeholder="Company name"
//         />
//       </div>

//       {/* ✅ PDF Upload */}
//       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//         <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>
//           Upload PDF (optional)
//         </label>
//         <input
//           ref={fileRef}
//           type="file"
//           accept="application/pdf"
//           disabled={loading}
//           onChange={(e) => {
//             const f = e.target.files?.[0];
//             if (f) extractFromPdf(f);
//           }}
//         />
//         <div style={{ fontSize: "0.8rem", opacity: 0.75, color: "#161616" }}>
//           Works for text-based PDFs. Scanned PDFs require OCR.
//         </div>
//       </div>

//       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//         <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>
//           Assignment text / paste excerpt
//         </label>
//         <textarea
//           style={{
//             width: "100%",
//             height: "160px",
//             padding: "0.625rem",
//             borderRadius: "6px",
//             border: "1px solid rgba(0,0,0,0.1)",
//             fontSize: "0.95rem",
//             fontFamily: "inherit",
//             transition: "box-shadow 180ms ease",
//             resize: "none",
//             color: "#161616",
//             backgroundColor: "#fff",
//           }}
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Paste assignment or extract from PDF"
//         />
//       </div>

//       <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
//         <button
//           onClick={generate}
//           disabled={loading || !text.trim()}
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: "0.6rem",
//             padding: "0.6rem 1rem",
//             borderRadius: "10px",
//             fontWeight: 600,
//             cursor: loading ? "not-allowed" : "pointer",
//             border: "none",
//             background: loading ? "rgba(16, 185, 129, 0.3)" : "linear-gradient(90deg, #10b981, #059669)",
//             color: "#FEFACD",
//           }}
//         >
//           {loading ? "Working…" : "Generate Reference Doc"}
//         </button>

//         {status && <span style={{ fontSize: "0.875rem", color: "#161616" }}>{status}</span>}
//       </div>

//       {error && <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</div>}

//       {markdown && (
//         <div style={{ marginTop: "1rem" }}>
//           <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem", color: "#161616" }}>
//             Preview
//           </h3>

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

//           <div style={{ marginTop: "0.75rem" }}>
//             <button
//               onClick={publishToNotion}
//               disabled={loading}
//               style={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "0.6rem",
//                 padding: "0.6rem 1rem",
//                 borderRadius: "10px",
//                 fontWeight: 600,
//                 cursor: loading ? "not-allowed" : "pointer",
//                 border: "none",
//                 background: "linear-gradient(90deg, #F1E194, #fff6d8)",
//                 color: "#5B0E14",
//               }}
//             >
//               Create Notion Page
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";
import { useRef, useState } from "react";

export default function AssignmentGenerator() {
  const [company, setCompany] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  async function extractFromPdf(file: File) {
    setError(null);
    setStatus("Extracting text from PDF…");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/extract-pdf-text", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to extract PDF text");

      if (data?.warning) {
        // scanned / OCR case warning
        setError(data.warning);
      }

      const extracted = (data?.text || "").trim();

      // Update UI textbox
      setText(extracted);

      // ✅ Important: run generate using extracted directly (avoid async state issue)
      if (extracted) {
        await generate(extracted);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to extract PDF text");
    } finally {
      setLoading(false);
      setStatus("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // ✅ allow override text (used by extractFromPdf)
  async function generate(overrideText?: string) {
    setError(null);
    setMarkdown(null);
    setStatus("Generating reference doc…");
    setLoading(true);

    const assignmentText = (overrideText ?? text).trim();
    if (!assignmentText) {
      setLoading(false);
      setStatus("");
      setError("Please add assignment text first.");
      return;
    }

    try {
      const res = await fetch("/api/generate-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: company, assignmentText }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Generation failed");

      setMarkdown(data.markdown || "");
    } catch (err: any) {
      setError(err?.message || "Generation failed");
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  async function publishToNotion() {
    if (!markdown) return;

    setError(null);
    setStatus("Creating Notion page…");
    setLoading(true);

    const newTab = window.open("about:blank", "_blank");
    if (newTab) {
      newTab.document.title = "Creating Notion Page…";
      newTab.document.body.innerHTML = `
        <div style="font-family:system-ui;padding:24px;">
          <h2 style="margin:0 0 8px;">Creating your Notion page…</h2>
          <p style="margin:0;opacity:.75;">Please keep this tab open.</p>
        </div>`;
    }

    try {
      const res = await fetch("/api/create-notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${company} - Assignment Reference`,
          markdown,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to publish");

      const url = data.preferredUrl || data.url || data.publicUrl || "";
      if (!url) throw new Error("Notion URL not returned from API.");

      if (newTab) newTab.location.href = url;
      else window.location.assign(url);
    } catch (err: any) {
      if (newTab) newTab.close();
      setError(err?.message || "Failed to publish");
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#161616" }}>
        Assignment Reference Doc
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label
          style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}
        >
          Company
        </label>
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
        <label
          style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}
        >
          Upload PDF (optional)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          disabled={loading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) extractFromPdf(f);
          }}
        />
        <div style={{ fontSize: "0.8rem", opacity: 0.75, color: "#161616" }}>
          Text PDFs extract instantly. Scanned PDFs auto-use OCR (first 3 pages).
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label
          style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}
        >
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

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button
          onClick={() => generate()}
          disabled={loading || !text.trim()}
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
          }}
        >
          {loading ? "Working…" : "Generate Reference Doc"}
        </button>

        {status && (
          <span style={{ fontSize: "0.875rem", color: "#161616" }}>
            {status}
          </span>
        )}
      </div>

      {error && (
        <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</div>
      )}

      {markdown && (
        <div style={{ marginTop: "1rem" }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "#161616",
            }}
          >
            Preview
          </h3>

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

          <div style={{ marginTop: "0.75rem" }}>
            <button
              onClick={publishToNotion}
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
                background: "linear-gradient(90deg, #F1E194, #fff6d8)",
                color: "#5B0E14",
              }}
            >
              Create Notion Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}