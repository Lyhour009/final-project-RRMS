import Link from "next/link";
import { Building2, ArrowRight, CheckCircle2 } from "lucide-react";

const PERKS = [
  "មើលវិក្កយបត្រ និងប្រវត្តិការបង់ប្រាក់",
  "ដាក់ពាក្យសុំជួសជុលបន្ទប់",
  "ទទួលការជូនដំណឹងភ្លាមៗ",
  "មើលកិច្ចសន្យា និងព័ត៌មានបន្ទប់",
];

// ─── TenantCTA ────────────────────────────────────────────────────────────────

export function TenantCTA({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-8">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full mb-4">
            <Building2 className="w-3 h-3" />
            សម្រាប់អ្នកជួល
          </div>
          <h2 className="text-xl font-bold text-white mb-3">
            ចូលប្រើ Dashboard របស់អ្នក
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            ក្នុង Dashboard របស់អ្នកជួល អ្នកអាច៖
          </p>
          <ul className="space-y-2">
            {PERKS.map((p) => (
              <li
                key={p}
                className="flex items-center gap-2 text-sm text-slate-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0">
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2 text-lg rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
          >
            {isLoggedIn ? "ទៅ Dashboard" : "ចូលគណនី"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

// export function HomeFooter() {
//   return (
//     <footer className="relative z-10 border-t border-white/[0.06] py-8">
//       <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
//         <div className="flex items-center gap-2">
//           <Building2 className="w-4 h-4 text-indigo-400" />
//           <span className="text-sm text-slate-500">
//             RRMS © {new Date().getFullYear()}
//           </span>
//         </div>
//         <p className="text-xs text-slate-600">Rental Room Management System</p>
//       </div>
//     </footer>
//   );
// }
