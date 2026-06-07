import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";

interface HomeNavbarProps {
  isLoggedIn: boolean;
}

export default function HomeNavbar({ isLoggedIn }: HomeNavbarProps) {
  return (
    <nav className="relative z-50 border-b border-white/[0.06] backdrop-blur-xl bg-slate-950/80">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">
            RRMS
          </span>
          <span className="hidden sm:block text-[11px] text-slate-600 border-l border-white/[0.08] pl-2.5 ml-0.5">
            ប្រព័ន្ធគ្រប់គ្រងបន្ទប់ជួលទំនើប
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2"
              >
                ចូលគណនី
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                ចាប់ផ្តើម
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
