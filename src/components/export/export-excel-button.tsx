"use client";

import { Download } from "lucide-react";

export function ExportExcelButton({
  data,
  fileName,
}: {
  data: Record<string, unknown>[];
  fileName: string;
}) {
  function exportExcel() {
    if (!data || data.length === 0) {
      alert("មិនមានទិន្នន័យសម្រាប់ Export");
      return;
    }

    const headers = Array.from(
      new Set(data.flatMap((row) => Object.keys(row))),
    );
    const escapeCell = (value: unknown) => {
      const raw = value == null ? "" : String(value);
      const formulaSafe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
      return `"${formulaSafe.replaceAll('"', '""')}"`;
    };
    const csv = [
      headers.map(escapeCell).join(","),
      ...data.map((row) =>
        headers.map((header) => escapeCell(row[header])).join(","),
      ),
    ].join("\r\n");
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileName}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportExcel}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-(--panel-border) bg-(--panel) px-4 text-sm font-medium text-(--panel-text) shadow-sm transition hover:border-indigo-500/30 hover:bg-(--panel-hover)"
    >
      <Download size={16} />
      នាំចេញ Excel
    </button>
  );
}
