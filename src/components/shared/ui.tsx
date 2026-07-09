import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── StatusBadge ──────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active: {
    label: "សកម្ម",
    cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  paid: {
    label: "បានបង់",
    cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  unpaid: {
    label: "មិនទាន់បង់",
    cls: "text-amber-400  bg-amber-500/10  border-amber-500/20",
  },
  overdue: {
    label: "ហួសកំណត់",
    cls: "text-rose-400   bg-rose-500/10   border-rose-500/20",
  },
  pending: {
    label: "រង់ចាំ",
    cls: "text-amber-400  bg-amber-500/10  border-amber-500/20",
  },
  resolved: {
    label: "បានដោះស្រាយ",
    cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  in_progress: {
    label: "កំពុងធ្វើ",
    cls: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  terminated: {
    label: "បានបញ្ចប់",
    cls: "text-slate-400  bg-slate-500/10  border-slate-500/20",
  },
  available: {
    label: "ទំនេរ",
    cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  occupied: {
    label: "កំពុងភ្ជាប់",
    cls: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  maintenance: {
    label: "ជួសជុល",
    cls: "text-amber-400  bg-amber-500/10  border-amber-500/20",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? {
    label: status,
    cls: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  };
  return (
    <span
      className={cn(
        "text-[11px] font-medium px-2 py-0.5 rounded-md border",
        s.cls,
      )}
    >
      {s.label}
    </span>
  );
}

// ─── PriorityDot ──────────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-rose-400",
  medium: "bg-amber-400",
  low: "bg-slate-400",
};

export function PriorityDot({ priority }: { priority: string }) {
  return (
    <div
      className={cn(
        "w-1.5 h-1.5 rounded-full shrink-0",
        PRIORITY_COLORS[priority] ?? "bg-slate-400",
      )}
    />
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-(--panel) border border-(--panel-border-subtle) rounded-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── CardHeader ───────────────────────────────────────────────────────────────

import Link from "next/link";

export function CardHeader({
  icon: Icon,
  title,
  href,
}: {
  icon: React.ElementType;
  title: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-(--panel-border-subtle)">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <span className="text-sm font-semibold text-(--panel-text)">{title}</span>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
        >
          មើលទាំងអស់
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}

// ─── SectionCard (settings-style wrapper) ────────────────────────────────────

export function SectionCard({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-(--panel) border border-(--panel-border-subtle) rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-(--panel-border-subtle) flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-(--panel-text)">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export function Toast({
  msg,
  type,
}: {
  msg: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs px-3 py-2 rounded-lg border",
        type === "success"
          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          : "text-rose-400 bg-rose-500/10 border-rose-500/20",
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      )}
      {msg}
    </div>
  );
}

// ─── Field (form label + error) ───────────────────────────────────────────────

export function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {!error && hint && <p className="text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

// ─── AmbientBackground ───────────────────────────────────────────────────────

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px]" />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
