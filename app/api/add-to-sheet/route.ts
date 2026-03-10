import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

function parsePrivateKey(raw: string): string {
    let key = raw.trim();

    // Remove surrounding quotes if present (single or double)
    if (
        (key.startsWith('"') && key.endsWith('"')) ||
        (key.startsWith("'") && key.endsWith("'"))
    ) {
        key = key.slice(1, -1);
    }

    // Replace literal \n (two chars) with actual newline
    key = key.replace(/\\n/g, "\n");

    // If still no real newlines in the body, reconstruct PEM format manually
    if (!key.includes("\n")) {
        const beginMatch = key.match(/-----BEGIN ([A-Z ]+)-----/);
        const endMatch = key.match(/-----END ([A-Z ]+)-----/);
        if (beginMatch && endMatch) {
            const header = `-----BEGIN ${beginMatch[1]}-----`;
            const footer = `-----END ${endMatch[1]}-----`;
            const body = key
                .replace(/-----BEGIN [A-Z ]+-----/, "")
                .replace(/-----END [A-Z ]+-----/, "")
                .replace(/\s/g, "");
            const chunked = body.match(/.{1,64}/g)?.join("\n") ?? body;
            key = `${header}\n${chunked}\n${footer}`;
        }
    }

    return key;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            jobId,
            companyName,
            interviewRound,
            refDocumentTitle,
            refDocLink,
            documentType,
            createdBy,
            service,
        } = body;

        const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || "";
        const projectId = process.env.GOOGLE_PROJECT_ID || "";
        const privateKeyId = process.env.GOOGLE_PRIVATE_KEY_ID || "";
        const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY || "";
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || "";
        const clientId = process.env.GOOGLE_CLIENT_ID || "";

        const missing: string[] = [];
        if (!SPREADSHEET_ID) missing.push("GOOGLE_SHEET_ID");
        if (!clientEmail) missing.push("GOOGLE_CLIENT_EMAIL");
        if (!privateKeyRaw) missing.push("GOOGLE_PRIVATE_KEY");

        if (missing.length > 0) {
            return NextResponse.json(
                { error: `Missing environment variables: ${missing.join(", ")}` },
                { status: 500 }
            );
        }

        const privateKey = parsePrivateKey(privateKeyRaw);

        const auth = new google.auth.GoogleAuth({
            credentials: {
                type: "service_account",
                project_id: projectId,
                private_key_id: privateKeyId,
                private_key: privateKey,
                client_email: clientEmail,
                client_id: clientId,
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const timeLine = new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "Sheet1!A:I",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[
                    jobId || "",
                    companyName || "",
                    interviewRound || "",
                    refDocumentTitle || "",
                    refDocLink || "",
                    documentType || "",
                    createdBy || "",
                    timeLine,
                    service || "",
                ]],
            },
        });

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("add-to-sheet error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to add to sheet" },
            { status: 500 }
        );
    }
}
