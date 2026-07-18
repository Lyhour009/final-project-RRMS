"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Application route failed", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--panel-inset) p-6 text-(--panel-text)">
      <section className="w-full max-w-lg rounded-3xl border border-(--panel-border) bg-(--panel) p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <AlertTriangle />
        </div>
        <h1 className="mt-5 text-2xl font-bold">មានបញ្ហាក្នុងការផ្ទុកទំព័រ</h1>
        <p className="mt-2 text-sm leading-6 text-(--panel-text-muted)">
          សូមសាកល្បងម្តងទៀត។ ប្រសិនបើបញ្ហានៅតែបន្ត សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធ។
        </p>
        {error.digest && <p className="mt-3 text-xs text-(--panel-text-subtle)">Reference: {error.digest}</p>}
        <Button onClick={unstable_retry} className="mt-6 gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">
          <RotateCcw size={16} /> សាកល្បងម្តងទៀត
        </Button>
      </section>
    </main>
  );
}
