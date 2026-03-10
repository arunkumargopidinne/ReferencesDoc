"use client";

import { useState } from "react";

export type SheetEntry = {
    jobId: string;
    companyName: string;
    interviewRound: string;
    documentType: string;
    createdBy: string;
    /** Automatically set by each generator — not shown in UI */
    service?: string;
};

export const INTERVIEW_ROUNDS = [
    "TR/TR1",
    "TR2",
    "MR",
    "Assessment + TR1 + TR2 + HR",
    "Offline Drive",
    "CEO Round",
    "Culture Fit Round",
    "Aptitude",
    "HR",
    "Assignment",
];

export const DOCUMENT_TYPES = [
    "Assignment Ref Doc",
    "Assessment Ref Doc",
    "TR Ref Doc",
    "Concepts Ref Doc",
];

type Props = {
    companyName?: string;
    onConfirm: (entry: SheetEntry) => void;
    onCancel: () => void;
    loading?: boolean;
};

const inputStyle = {
    width: "100%",
    padding: "0.625rem",
    borderRadius: "6px",
    border: "1px solid rgba(0,0,0,0.1)",
    fontSize: "0.95rem",
    color: "#161616",
    backgroundColor: "#fff",
    boxSizing: "border-box" as const,
};

const labelStyle = {
    fontSize: "0.875rem",
    fontWeight: 500 as const,
    color: "#161616",
    display: "block" as const,
    marginBottom: "0.35rem",
};

export default function SheetEntryModal({
    companyName: prefillCompany = "",
    onConfirm,
    onCancel,
    loading = false,
}: Props) {
    const [jobId, setJobId] = useState("");
    const [companyName, setCompanyName] = useState(prefillCompany);
    const [interviewRound, setInterviewRound] = useState(INTERVIEW_ROUNDS[0]);
    const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[2]);
    const [createdBy, setCreatedBy] = useState("");
    const [error, setError] = useState<string | null>(null);

    function handleConfirm() {
        if (!createdBy.trim()) {
            setError("Please enter your name in 'Created By'.");
            return;
        }
        setError(null);
        onConfirm({ jobId, companyName, interviewRound, documentType, createdBy });
    }

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "1rem",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: "14px",
                    padding: "2rem",
                    width: "100%",
                    maxWidth: "480px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#161616", margin: 0 }}>
                    📋 Add to Google Sheet
                </h2>
                <p style={{ fontSize: "0.875rem", color: "#6b6b6b", margin: 0 }}>
                    Fill in the details below. These will be logged automatically after the Notion page is created.
                </p>

                {/* Job ID */}
                <div>
                    <label style={labelStyle}>Job ID</label>
                    <input
                        style={inputStyle}
                        value={jobId}
                        onChange={(e) => setJobId(e.target.value)}
                        placeholder="e.g. JOB-001"
                    />
                </div>

                {/* Company Name */}
                <div>
                    <label style={labelStyle}>Company Name</label>
                    <input
                        style={inputStyle}
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                    />
                </div>

                {/* Interview Round */}
                <div>
                    <label style={labelStyle}>Interview Round</label>
                    <select
                        style={inputStyle}
                        value={interviewRound}
                        onChange={(e) => setInterviewRound(e.target.value)}
                    >
                        {INTERVIEW_ROUNDS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                {/* Document Type */}
                <div>
                    <label style={labelStyle}>Document Type</label>
                    <select
                        style={inputStyle}
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                    >
                        {DOCUMENT_TYPES.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                {/* Created By */}
                <div>
                    <label style={labelStyle}>
                        Created By <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                        style={inputStyle}
                        value={createdBy}
                        onChange={(e) => setCreatedBy(e.target.value)}
                        placeholder="Your name"
                    />
                </div>

                {error && (
                    <div style={{ color: "#dc2626", fontSize: "0.85rem" }}>{error}</div>
                )}

                {/* Buttons */}
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        style={{
                            padding: "0.6rem 1.25rem",
                            borderRadius: "8px",
                            border: "1px solid rgba(0,0,0,0.12)",
                            background: "transparent",
                            cursor: "pointer",
                            fontWeight: 600,
                            color: "#161616",
                            fontSize: "0.95rem",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        style={{
                            padding: "0.6rem 1.25rem",
                            borderRadius: "8px",
                            border: "none",
                            background: "linear-gradient(90deg, #5B0E14, #5F4A8B)",
                            color: "#FEFACD",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            opacity: loading ? 0.8 : 1,
                        }}
                    >
                        {loading ? "Saving..." : "Confirm & Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}
