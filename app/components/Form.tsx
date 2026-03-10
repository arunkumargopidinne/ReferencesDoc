// // 'use client';

// // import { useState } from 'react';

// // type NotionCreateResponse = {
// //   preferredUrl?: string;
// //   publicUrl?: string;
// //   url?: string;
// //   error?: string;
// // };

// // export default function Form() {
// //   const [companyName, setCompanyName] = useState('');
// //   const [jobDescription, setJobDescription] = useState('');
// //   const [techStack, setTechStack] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const [status, setStatus] = useState('Idle');
// //   const [error, setError] = useState<string | null>(null);
// //   const [notionUrl, setNotionUrl] = useState('');

// //   async function handleSubmit(e: React.FormEvent) {
// //     e.preventDefault();
// //     setError(null);
// //     setNotionUrl('');
// //     setLoading(true);

// //     try {
// //       setStatus('1/3 Extracting topics...');
// //       const resTopics = await fetch('/api/extract-topics', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ companyName, jobDescription, techStack }),
// //       });

// //       if (!resTopics.ok) {
// //         throw new Error(await resTopics.text());
// //       }

// //       const dataTopics = await resTopics.json();
// //       const topics = dataTopics.topics || [];
// //       if (!topics.length) {
// //         throw new Error('No topics extracted');
// //       }

// //       setStatus('2/3 Generating content...');
// //       const resContent = await fetch('/api/generate-content', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ topics }),
// //       });

// //       if (!resContent.ok) {
// //         throw new Error(await resContent.text());
// //       }

// //       const dataContent = await resContent.json();
// //       const markdown = (dataContent.markdown || '').trim();
// //       if (!markdown) {
// //         throw new Error('No content generated');
// //       }

// //       setStatus('3/3 Creating Notion page...');
// //       const resNotion = await fetch('/api/create-notion', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ title: `${companyName} - Reference Document`, markdown }),
// //       });

// //       const dataNotion = (await resNotion.json()) as NotionCreateResponse;
// //       if (!resNotion.ok) {
// //         throw new Error(dataNotion.error || 'Failed to create Notion page');
// //       }

// //       const url = dataNotion.preferredUrl || dataNotion.publicUrl || dataNotion.url || '';
// //       if (!url) {
// //         throw new Error('Notion URL not returned from API');
// //       }

// //       setNotionUrl(url);
// //       setStatus('Completed. Notion page created successfully.');
// //     } catch (err: unknown) {
// //       setStatus('Failed.');
// //       setError(err instanceof Error ? err.message : 'Failed to generate Notion page');
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   return (
// //     <form
// //       onSubmit={handleSubmit}
// //       style={{
// //         maxWidth: '48rem',
// //         margin: '0 auto',
// //         display: 'flex',
// //         flexDirection: 'column',
// //         gap: '1rem',
// //       }}
// //     >
// //       <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#161616' }}>Interview Prep Input</h2>

// //       <div
// //         aria-live="polite"
// //         style={{
// //           minHeight: '2.5rem',
// //           display: 'flex',
// //           alignItems: 'center',
// //           padding: '0.625rem 0.75rem',
// //           borderRadius: '8px',
// //           border: '1px solid rgba(0,0,0,0.08)',
// //           background: 'rgba(255,255,255,0.78)',
// //           color: '#5B0E14',
// //           fontSize: '0.9rem',
// //         }}
// //       >
// //         <span style={{ fontWeight: 700, marginRight: '0.4rem' }}>Status:</span>
// //         <span>{status}</span>
// //       </div>

// //       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
// //         <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#161616' }}>Company</label>
// //         <input
// //           value={companyName}
// //           onChange={(e) => setCompanyName(e.target.value)}
// //           style={{
// //             width: '100%',
// //             color: '#161616',
// //             backgroundColor: '#fff',
// //             padding: '0.625rem',
// //             borderRadius: '6px',
// //             border: '1px solid rgba(0,0,0,0.1)',
// //             fontSize: '0.95rem',
// //           }}
// //           placeholder="Acme Corp"
// //         />
// //       </div>

// //       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
// //         <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#161616' }}>Job description / Questions</label>
// //         <textarea
// //           value={jobDescription}
// //           onChange={(e) => setJobDescription(e.target.value)}
// //           style={{
// //             width: '100%',
// //             height: '156px',
// //             padding: '0.625rem',
// //             color: '#161616',
// //             backgroundColor: '#fff',
// //             borderRadius: '6px',
// //             border: '1px solid rgba(0,0,0,0.1)',
// //             fontSize: '0.95rem',
// //             fontFamily: 'inherit',
// //             resize: 'none',
// //           }}
// //           placeholder="Paste JD or drilldown questions"
// //         />
// //       </div>

// //       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
// //         <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#161616' }}>Tech stack</label>
// //         <input
// //           value={techStack}
// //           onChange={(e) => setTechStack(e.target.value)}
// //           style={{
// //             width: '100%',
// //             padding: '0.625rem',
// //             borderRadius: '6px',
// //             color: '#161616',
// //             backgroundColor: '#fff',
// //             border: '1px solid rgba(0,0,0,0.1)',
// //             fontSize: '0.95rem',
// //           }}
// //           placeholder="React, Node.js, PostgreSQL"
// //         />
// //       </div>

// //       {error && <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>}

// //       {notionUrl && (
// //         <a
// //           href={notionUrl}
// //           target="_blank"
// //           rel="noreferrer"
// //           style={{
// //             width: 'fit-content',
// //             textDecoration: 'none',
// //             fontSize: '0.9rem',
// //             fontWeight: 600,
// //             color: '#5B0E14',
// //             padding: '0.55rem 0.85rem',
// //             borderRadius: '8px',
// //             border: '1px solid rgba(91,14,20,0.24)',
// //             background: 'rgba(255,255,255,0.78)',
// //           }}
// //         >
// //           Open Created Notion Page
// //         </a>
// //       )}

// //       <button
// //         type="submit"
// //         disabled={loading}
// //         style={{
// //           display: 'inline-flex',
// //           alignItems: 'center',
// //           justifyContent: 'center',
// //           gap: '0.6rem',
// //           padding: '0.7rem 1rem',
// //           borderRadius: '10px',
// //           fontWeight: 700,
// //           cursor: loading ? 'not-allowed' : 'pointer',
// //           border: 'none',
// //           background: loading ? 'rgba(91,14,20,0.3)' : 'linear-gradient(90deg, #5B0E14, #5F4A8B)',
// //           color: '#FEFACD',
// //           opacity: loading ? 0.85 : 1,
// //         }}
// //       >
// //         {loading ? 'Working...' : 'Generate Notion Doc'}
// //       </button>
// //     </form>
// //   );
// // }

// // "use client";

// // import { useState } from "react";
// // import SheetEntryModal, { SheetEntry } from "../components/sheetEntryModal";
// // import { logToSheet } from "../../src/lib/sheets";

// // type NotionCreateResponse = {
// //   preferredUrl?: string;
// //   publicUrl?: string;
// //   url?: string;
// //   error?: string;
// // };

// // export default function DrilldownGenerator() {
// //   const [companyName, setCompanyName] = useState("");
// //   const [jobDescription, setJobDescription] = useState("");
// //   const [techStack, setTechStack] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [status, setStatus] = useState("Idle");
// //   const [error, setError] = useState<string | null>(null);
// //   const [notionUrl, setNotionUrl] = useState("");

// //   // Sheet modal state
// //   const [showModal, setShowModal] = useState(false);

// //   function handleSubmitClick() {
// //     setShowModal(true);
// //   }

// //   async function handleModalConfirm(sheetEntry: SheetEntry) {
// //     setShowModal(false);
// //     setError(null);
// //     setNotionUrl("");
// //     setLoading(true);

// //     const company = sheetEntry.companyName || companyName;

// //     try {
// //       setStatus("1/3 Extracting topics...");
// //       const resTopics = await fetch("/api/extract-topics", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ companyName: company, jobDescription, techStack }),
// //       });
// //       if (!resTopics.ok) throw new Error(await resTopics.text());

// //       const dataTopics = await resTopics.json();
// //       const topics = dataTopics.topics || [];
// //       if (!topics.length) throw new Error("No topics extracted");

// //       setStatus("2/3 Generating content...");
// //       const resContent = await fetch("/api/generate-content", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ topics }),
// //       });
// //       if (!resContent.ok) throw new Error(await resContent.text());

// //       const dataContent = await resContent.json();
// //       const markdown = (dataContent.markdown || "").trim();
// //       if (!markdown) throw new Error("No content generated");

// //       setStatus("3/3 Creating Notion page...");
// //       const notionTitle = `${company} - Reference Document`;
// //       const resNotion = await fetch("/api/create-notion", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ title: notionTitle, markdown }),
// //       });

// //       const dataNotion = (await resNotion.json()) as NotionCreateResponse;
// //       if (!resNotion.ok) throw new Error(dataNotion.error || "Failed to create Notion page");

// //       const url = dataNotion.preferredUrl || dataNotion.publicUrl || dataNotion.url || "";
// //       if (!url) throw new Error("Notion URL not returned from API");

// //       setNotionUrl(url);

// //       // Log to sheet
// //       setStatus("Logging to Google Sheet...");
// //       try {
// //         await logToSheet({ ...sheetEntry, companyName: company, refDocumentTitle: notionTitle, refDocLink: url });
// //         setStatus("Completed. Notion page created & logged to sheet.");
// //       } catch (sheetErr: unknown) {
// //         console.error("Sheet log failed:", sheetErr);
// //         setStatus("Notion page created. Sheet logging failed (check console).");
// //       }
// //     } catch (err: unknown) {
// //       setStatus("Failed.");
// //       setError(err instanceof Error ? err.message : "Failed to generate Notion page");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   return (
// //     <div style={{ maxWidth: "48rem", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
// //       {showModal && (
// //         <SheetEntryModal
// //           companyName={companyName}
// //           onConfirm={handleModalConfirm}
// //           onCancel={() => setShowModal(false)}
// //           loading={loading}
// //         />
// //       )}

// //       <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#161616" }}>Interview Prep Input</h2>

// //       <div aria-live="polite" style={{ minHeight: "2.5rem", display: "flex", alignItems: "center", padding: "0.625rem 0.75rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.78)", color: "#5B0E14", fontSize: "0.9rem" }}>
// //         <span style={{ fontWeight: 700, marginRight: "0.4rem" }}>Status:</span>
// //         <span>{status}</span>
// //       </div>

// //       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
// //         <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>Company</label>
// //         <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={{ width: "100%", color: "#161616", backgroundColor: "#fff", padding: "0.625rem", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.1)", fontSize: "0.95rem" }} placeholder="Acme Corp" />
// //       </div>

// //       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
// //         <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>Job description / Questions</label>
// //         <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} style={{ width: "100%", height: "156px", padding: "0.625rem", color: "#161616", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.1)", fontSize: "0.95rem", fontFamily: "inherit", resize: "none" }} placeholder="Paste JD or drilldown questions" />
// //       </div>

// //       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
// //         <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#161616" }}>Tech stack</label>
// //         <input value={techStack} onChange={(e) => setTechStack(e.target.value)} style={{ width: "100%", padding: "0.625rem", borderRadius: "6px", color: "#161616", backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.1)", fontSize: "0.95rem" }} placeholder="React, Node.js, PostgreSQL" />
// //       </div>

// //       {error && <div style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</div>}

// //       {notionUrl && (
// //         <a href={notionUrl} target="_blank" rel="noreferrer" style={{ width: "fit-content", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, color: "#5B0E14", padding: "0.55rem 0.85rem", borderRadius: "8px", border: "1px solid rgba(91,14,20,0.24)", background: "rgba(255,255,255,0.78)" }}>
// //           Open Created Notion Page
// //         </a>
// //       )}

// //       <button
// //         onClick={handleSubmitClick}
// //         disabled={loading}
// //         style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", padding: "0.7rem 1rem", borderRadius: "10px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", border: "none", background: loading ? "rgba(91,14,20,0.3)" : "linear-gradient(90deg, #5B0E14, #5F4A8B)", color: "#FEFACD", opacity: loading ? 0.85 : 1 }}
// //       >
// //         {loading ? "Working..." : "Generate Notion Doc"}
// //       </button>
// //     </div>
// //   );
// // }





// // "use client";
// // import { useState, useRef } from "react";
// // import SheetEntryModal, { SheetEntry } from "../components/sheetEntryModal";
// // import { logToSheet } from "../../src/lib/sheets";

// // type NotionCreateResponse = { preferredUrl?: string; publicUrl?: string; url?: string; error?: string };
// // type TaskProps = { startTask: (cancelFn: () => void) => void; updateTask: (p: number, s: string) => void; endTask: () => void };

// // export default function DrilldownGenerator({ startTask, updateTask, endTask }: TaskProps) {
// //   const [companyName, setCompanyName] = useState("");
// //   const [jobDescription, setJobDescription] = useState("");
// //   const [techStack, setTechStack] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const [notionUrl, setNotionUrl] = useState("");
// //   const [showModal, setShowModal] = useState(false);
// //   const cancelledRef = useRef(false);

// //   async function handleModalConfirm(sheetEntry: SheetEntry) {
// //     setShowModal(false);
// //     setError(null);
// //     setNotionUrl("");
// //     setLoading(true);
// //     cancelledRef.current = false;
// //     startTask(() => { cancelledRef.current = true; });
// //     const company = sheetEntry.companyName || companyName;
// //     try {
// //       updateTask(10, "Extracting topics…");
// //       const resTopics = await fetch("/api/extract-topics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyName: company, jobDescription, techStack }) });
// //       if (cancelledRef.current) return;
// //       if (!resTopics.ok) throw new Error(await resTopics.text());
// //       const dataTopics = await resTopics.json();
// //       const topics = dataTopics.topics || [];
// //       if (!topics.length) throw new Error("No topics extracted");

// //       updateTask(40, "Generating content…");
// //       const resContent = await fetch("/api/generate-content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topics }) });
// //       if (cancelledRef.current) return;
// //       if (!resContent.ok) throw new Error(await resContent.text());
// //       const dataContent = await resContent.json();
// //       const markdown = (dataContent.markdown || "").trim();
// //       if (!markdown) throw new Error("No content generated");

// //       updateTask(75, "Creating Notion page…");
// //       const notionTitle = `${company} - Reference Document`;
// //       const resNotion = await fetch("/api/create-notion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: notionTitle, markdown }) });
// //       if (cancelledRef.current) return;
// //       const dataNotion = (await resNotion.json()) as NotionCreateResponse;
// //       if (!resNotion.ok) throw new Error(dataNotion.error || "Failed");
// //       const url = dataNotion.preferredUrl || dataNotion.publicUrl || dataNotion.url || "";
// //       if (!url) throw new Error("No URL returned");
// //       setNotionUrl(url);

// //       updateTask(92, "Logging to Google Sheet…");
// //       try { await logToSheet({ ...sheetEntry, companyName: company, refDocumentTitle: notionTitle, refDocLink: url }); } catch { }
// //       endTask();
// //     } catch (err: unknown) {
// //       if (!cancelledRef.current) setError(err instanceof Error ? err.message : "Failed");
// //       endTask();
// //     } finally { setLoading(false); }
// //   }

// //   return (
// //     <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "48rem", margin: "0 auto" }}>
// //       {showModal && <SheetEntryModal companyName={companyName} onConfirm={handleModalConfirm} onCancel={() => setShowModal(false)} loading={loading} />}
// //       <h2 style={headingStyle}>Drilldown — Job Description Input</h2>
// //       <Field label="Company"><input style={inputStyle} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" /></Field>
// //       <Field label="Job Description / Questions"><textarea style={{ ...inputStyle, height: "150px", resize: "none", fontFamily: "inherit" }} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste JD or drilldown questions" /></Field>
// //       <Field label="Tech Stack"><input style={inputStyle} value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, Node.js, PostgreSQL" /></Field>
// //       {error && <div style={errorStyle}>{error}</div>}
// //       {notionUrl && <NotionLink url={notionUrl} />}
// //       <button onClick={() => setShowModal(true)} disabled={loading} style={btnPrimary(loading)}>
// //         {loading ? <LoadingDots /> : "Generate Notion Doc"}
// //       </button>
// //     </div>
// //   );
// // }

// // function Field({ label, children }: { label: string; children: React.ReactNode }) {
// //   return <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}><label style={labelStyle}>{label}</label>{children}</div>;
// // }
// // function NotionLink({ url }: { url: string }) {
// //   return <a href={url} target="_blank" rel="noreferrer" style={{ width: "fit-content", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, color: "#F1E194", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid rgba(241,225,148,0.3)", background: "rgba(241,225,148,0.07)", fontFamily: "monospace" }}>↗ Open Notion Page</a>;
// // }
// // function LoadingDots() {
// //   return <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FEFACD", animation: "pulse 1s infinite" }} />Working…</span>;
// // }
// // const headingStyle: React.CSSProperties = { fontSize: "1.4rem", fontWeight: 700, color: "#FEFACD", margin: 0 };
// // const labelStyle: React.CSSProperties = { fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" };
// // const inputStyle: React.CSSProperties = { width: "100%", padding: "0.7rem 0.875rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#f3f3f6", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" };
// // const errorStyle: React.CSSProperties = { color: "#fca5a5", fontSize: "0.85rem", fontFamily: "monospace" };
// // const btnPrimary = (loading: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", padding: "0.75rem 1.5rem", borderRadius: "10px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", border: "none", background: loading ? "rgba(95,74,139,0.3)" : "linear-gradient(135deg, #5B0E14, #5F4A8B)", color: "#FEFACD", fontSize: "0.95rem", opacity: loading ? 0.7 : 1, boxShadow: loading ? "none" : "0 4px 20px rgba(91,14,20,0.35)", transition: "all 180ms ease" });


// "use client";
// import { useState, useRef } from "react";
// import SheetEntryModal, { SheetEntry } from "../components/sheetEntryModal";
// import { logToSheet } from "../../src/lib/sheets";

// type NotionCreateResponse = { preferredUrl?: string; publicUrl?: string; url?: string; error?: string };
// type TaskProps = { startTask: (cancelFn: () => void) => void; updateTask: (p: number, s: string) => void; endTask: () => void };

// export default function DrilldownGenerator({ startTask, updateTask, endTask }: TaskProps) {
//   const [companyName, setCompanyName] = useState("");
//   const [jobDescription, setJobDescription] = useState("");
//   const [techStack, setTechStack] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [notionUrl, setNotionUrl] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const cancelledRef = useRef(false);

//   async function handleModalConfirm(sheetEntry: SheetEntry) {
//     setShowModal(false);
//     setError(null);
//     setNotionUrl("");
//     setLoading(true);
//     cancelledRef.current = false;
//     startTask(() => { cancelledRef.current = true; });
//     const company = sheetEntry.companyName || companyName;
//     try {
//       updateTask(10, "Extracting topics…");
//       const resTopics = await fetch("/api/extract-topics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyName: company, jobDescription, techStack }) });
//       if (cancelledRef.current) return;
//       if (!resTopics.ok) throw new Error(await resTopics.text());
//       const dataTopics = await resTopics.json();
//       const topics = dataTopics.topics || [];
//       if (!topics.length) throw new Error("No topics extracted");

//       updateTask(40, "Generating content…");
//       const resContent = await fetch("/api/generate-content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topics }) });
//       if (cancelledRef.current) return;
//       if (!resContent.ok) throw new Error(await resContent.text());
//       const dataContent = await resContent.json();
//       const markdown = (dataContent.markdown || "").trim();
//       if (!markdown) throw new Error("No content generated");

//       updateTask(75, "Creating Notion page…");
//       const notionTitle = `${company} - Reference Document`;
//       const resNotion = await fetch("/api/create-notion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: notionTitle, markdown }) });
//       if (cancelledRef.current) return;
//       const dataNotion = (await resNotion.json()) as NotionCreateResponse;
//       if (!resNotion.ok) throw new Error(dataNotion.error || "Failed");
//       const url = dataNotion.preferredUrl || dataNotion.publicUrl || dataNotion.url || "";
//       if (!url) throw new Error("No URL returned");
//       setNotionUrl(url);

//       updateTask(92, "Logging to Google Sheet…");
//       try { await logToSheet({ ...sheetEntry, companyName: company, refDocumentTitle: notionTitle, refDocLink: url }); } catch { }
//       endTask();
//     } catch (err: unknown) {
//       if (!cancelledRef.current) setError(err instanceof Error ? err.message : "Failed");
//       endTask();
//     } finally { setLoading(false); }
//   }

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "48rem", margin: "0 auto" }}>
//       {showModal && <SheetEntryModal companyName={companyName} onConfirm={handleModalConfirm} onCancel={() => setShowModal(false)} loading={loading} />}
//       <h2 style={headingStyle}>Drilldown — Job Description Input</h2>
//       <Field label="Company"><input style={inputStyle} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" /></Field>
//       <Field label="Job Description / Questions"><textarea style={{ ...inputStyle, height: "150px", resize: "none", fontFamily: "inherit" }} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste JD or drilldown questions" /></Field>
//       <Field label="Tech Stack"><input style={inputStyle} value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, Node.js, PostgreSQL" /></Field>
//       {error && <div style={errorStyle}>{error}</div>}
//       {notionUrl && <NotionLink url={notionUrl} />}
//       <button onClick={() => setShowModal(true)} disabled={loading} style={btnPrimary(loading)}>
//         {loading ? <LoadingDots /> : "Generate Notion Doc"}
//       </button>
//     </div>
//   );
// }

// function Field({ label, children }: { label: string; children: React.ReactNode }) {
//   return <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}><label style={labelStyle}>{label}</label>{children}</div>;
// }
// function NotionLink({ url }: { url: string }) {
//   return <a href={url} target="_blank" rel="noreferrer" style={{ width: "fit-content", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, color: "#F1E194", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid rgba(241,225,148,0.3)", background: "rgba(241,225,148,0.07)", fontFamily: "monospace" }}>↗ Open Notion Page</a>;
// }
// function LoadingDots() {
//   return <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FEFACD", animation: "pulse 1s infinite" }} />Working…</span>;
// }
// const headingStyle: React.CSSProperties = { fontSize: "1.4rem", fontWeight: 700, color: "#FEFACD", margin: 0 };
// const labelStyle: React.CSSProperties = { fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" };
// const inputStyle: React.CSSProperties = { width: "100%", padding: "0.7rem 0.875rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#f3f3f6", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" };
// const errorStyle: React.CSSProperties = { color: "#fca5a5", fontSize: "0.85rem", fontFamily: "monospace" };
// const btnPrimary = (loading: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", padding: "0.75rem 1.5rem", borderRadius: "10px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", border: "none", background: loading ? "rgba(95,74,139,0.3)" : "linear-gradient(135deg, #5B0E14, #5F4A8B)", color: "#FEFACD", fontSize: "0.95rem", opacity: loading ? 0.7 : 1, boxShadow: loading ? "none" : "0 4px 20px rgba(91,14,20,0.35)", transition: "all 180ms ease" });
