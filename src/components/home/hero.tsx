import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  isLoggedIn: boolean;
}

export default function HeroSection({ isLoggedIn }: HeroSectionProps) {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-24 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        ប្រព័ន្ធគ្រប់គ្រងបន្ទប់ជួលទំនើប
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
        គ្រប់គ្រងបន្ទប់ជួល
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
          ងាយស្រួល ទំនើប
        </span>
      </h1>

      <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
        ប្រព័ន្ធ RRMS ជួយម្ចាស់បន្ទប់ និងអ្នកជួលគ្រប់គ្រង វិក្កយបត្រ កិច្ចសន្យា
        និងការជូនដំណឹងដោយស្វ័យប្រវត្តិ
      </p>

      {/* CTA buttons */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {isLoggedIn ? (
          <Link
            href="/tenant/overview"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white  px-6 py-2 text-lg font-medium rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
          >
            ទៅ Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
            >
              ចូលគណនី
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-8 mt-16 pt-8 border-t border-white/[0.06]">
        {[
          { value: "100%", label: "ស្វ័យប្រវត្តិ" },
          { value: "24/7", label: "ប្រើបានគ្រប់ពេល" },
          { value: "Real-time", label: "ការជូនដំណឹង" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
