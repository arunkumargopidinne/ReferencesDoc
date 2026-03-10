import { SheetEntry } from "../../app/components/sheetEntryModal";

type LogToSheetParams = SheetEntry & {
    refDocumentTitle: string;
    refDocLink: string;
};

export async function logToSheet(params: LogToSheetParams): Promise<void> {
    const res = await fetch("/api/add-to-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
            (data as { error?: string }).error || "Failed to log to Google Sheet"
        );
    }
}
