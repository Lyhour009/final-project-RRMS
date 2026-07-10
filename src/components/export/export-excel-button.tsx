"use client";

import { Download } from "lucide-react";

export function ExportExcelButton({
  data,
  fileName,
}: {
  data: Record<string, any>[];
  fileName: string;
}) {
  async function exportExcel() {
    if (!data || data.length === 0) {
      alert("មិនមានទិន្នន័យសម្រាប់ Export");
      return;
    }

    const XLSX = await import("xlsx");

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  return (
    <button
      type="button"
      onClick={exportExcel}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-(--panel-border) bg-(--panel) px-4 text-sm font-medium text-(--panel-text) hover:bg-(--panel-hover)"
    >
      <Download size={16} />
      Export Excel
    </button>
  );
}
