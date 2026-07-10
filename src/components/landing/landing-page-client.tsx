"use client";

import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bell,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Wrench,
  CheckCircle2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

// const STATS = [
//   { value: "99.9%", label: "ម៉ោងដំណើរការ" },
//   { value: "< 2s", label: "ល្បឿនឆ្លើយតប" },
//   { value: "256-bit", label: "ការការពារទិន្នន័យ" },
// ];

const FEATURES = [
  {
    icon: Building2,
    title: "គ្រប់គ្រងបន្ទប់",
    sub: "Room Management",
    desc: "ពិនិត្យតាមដានស្ថានភាពបន្ទប់ទំនេរ និងបន្ទប់ដែលមានអ្នកស្នាក់នៅបានគ្រប់ខណៈវេលា ព្រមទាំងទទួលការជម្រាបជូនព័ត៌មានថ្មីៗភ្លាមៗទាន់ហេតុការណ៍។",
    accent: "#6366f1",
  },
  {
    icon: FileText,
    title: "កិច្ចសន្យាឆ្លាតវៃ",
    sub: "Smart Contracts",
    desc: "កិច្ចសន្យាជួលតាមប្រព័ន្ធបច្ចេកវិទ្យាទំនើប រួមជាមួយនឹងការចុះហត្ថលេខាបែបឌីជីថល ការជម្រាបជូនដំណឹងអំពីការបន្តសុពលភាពកិច្ចសន្យា ព្រមទាំងការតម្កល់ទុកឯកសារប្រកបដោយសុវត្ថិភាពខ្ពស់បំផុត។",
    accent: "#8b5cf6",
  },
  {
    icon: CreditCard,
    title: "ទទួលការទូទាត់",
    sub: "Payment Flows",
    desc: "សម្រួលដល់ការទទួលប្រាក់តាមរយៈការស្កែនកូដ (QR Code) អមដោយការពិនិត្យនិងអនុម័តពីអ្នកគ្រប់គ្រង ព្រមទាំងមានប្រព័ន្ធកត់ត្រារាល់ប្រតិបត្តិការយ៉ាងលម្អិតនិងពេញលេញ។",
    accent: "#06b6d4",
  },
  {
    icon: Wrench,
    title: "សំណើថែទាំ",
    sub: "Maintenance Hub",
    desc: "អ្នកស្នាក់នៅអាចបញ្ជូនសំណើបានយ៉ាងរហ័សត្រឹមតែមួយខណៈពេល ចំណែកឯអ្នកគ្រប់គ្រងអាចពិនិត្យ ចាត់ចែង និងដោះស្រាយជូនភ្លាមៗ — អ្វីៗគ្រប់យ៉ាងត្រូវបានរួមបញ្ចូលគ្នានៅក្នុងប្រព័ន្ធតែមួយ។",
    accent: "#10b981",
  },
];

const WORKFLOW = [
  {
    step: "០១",
    title: "បន្ថែមបន្ទប់",
    sub: "Add Rooms",
    desc: "គ្រប់គ្រងអចលនទ្រព្យរបស់លោកអ្នក ទៅតាមទំហំផ្ទៃដី និងអត្រាតម្លៃជួលយ៉ាងច្បាស់លាស់។",
  },
  {
    step: "០២",
    title: "ចុះឈ្មោះអ្នកជួល",
    sub: "Onboard Tenants",
    desc: "ចេញវិក្កយបត្រប្រចាំខែដោយស្វ័យប្រវត្តិ រួមបញ្ចូលទាំងការគណនាថ្លៃទឹក-ភ្លើង ទៅតាមការប្រើប្រាស់ជាក់ស្តែង។",
  },
  {
    step: "០៣",
    title: "បង្កើតវិក្កយបត្រ",
    sub: "Generate Bills",
    desc: "បង្កើតប្រវត្តិរូប បញ្ចូលឯកសារអត្តសញ្ញាណបណ្ណ និងចាត់ចែងបន្ទប់ស្នាក់នៅ យ៉ាងឆាប់រហ័សក្នុងរយៈពេលមិនដល់មួយនាទី។",
  },
  {
    step: "០៤",
    title: "ទទួលការទូទាត់",
    sub: "Collect & Close",
    desc: "ទទួលការទូទាត់ប្រាក់តាមរយៈ QR Code ផ្ទៀងផ្ទាត់ភាពត្រឹមត្រូវនៃវិក្កយបត្រ និងបិទបញ្ជីចំណូល-ចំណាយប្រចាំខែ។",
  },
];

const ROLES = [
  {
    role: "Admin",
    khmer: "អ្នកគ្រប់គ្រង",
    icon: Users,
    accent: "#6366f1",
    desc: "ប្រព័ន្ធគ្រប់គ្រងបន្ទប់ជួលទំនើបសម្រាប់អ្នកគ្រប់គ្រងអចលនទ្រព្យ ដើម្បីតាមដានបន្ទប់ អ្នកជួល កិច្ចសន្យា និងចំណូល — ទាំងអស់នៅក្នុងប្រព័ន្ធតែមួយ។",
    perks: [
      "គ្រប់គ្រងបន្ទប់ និងអ្នកជួល",
      "បង្កើត និងចុះហត្ថលេខាកិច្ចសន្យា",
      "ចុះហត្ថលេខាកិច្ចសន្យា និងចំណូល ប្រចាំខែ",
      "ទទួលការជូនដំណឹងភ្លាមៗពីសំណើជួសជុល",
    ],
    cta: "/admin/dashboard",
    ctaLabel: "ចូលប្រើ Admin Portal",
  },
  {
    role: "Tenant",
    khmer: "អ្នកជួល",
    icon: ShieldCheck,
    accent: "#10b981",
    desc: "ប្រព័ន្ធគ្រប់គ្រងបន្ទប់ជួលសម្រាប់អ្នកជួល ដើម្បីទទួលការជូនដំណឹងភ្លាមៗពីកិច្ចសន្យា និងវិក្កយបត្រ ទៅតាមការប្រើប្រាស់ជាក់ស្តែង — ទាំងអស់នៅក្នុងប្រព័ន្ធតែមួយ។",
    perks: [
      "បង់ថ្លៃជួលតាម QR Code",
      "មើល និងចុះហត្ថលេខាកិច្ចសន្យា",
      "ដាក់សំណើជួសជុល",
      "ទទួលការជូនដំណឹងភ្លាមៗពីកិច្ចសន្យា និងវិក្កយបត្រ",
    ],
    cta: "/tenant/dashboard",
    ctaLabel: "ចូលប្រើ Tenant Portal",
  },
];

const TRUST_ITEMS = [
  "សុវត្ថិភាព AES-256",
  "ការគ្រប់គ្រងទិន្នន័យដ៏ល្អ",
  "ប្រព័ន្ធគ្រប់គ្រងបន្ទប់ជួលទំនើប",
  "ការគ្រប់គ្រងបន្ទប់ជួលទំនើបសម្រាប់អ្នកគ្រប់គ្រងអចលនទ្រព្យ",
  "ប្រព័ន្ធគ្រប់គ្រងបន្ទប់ជួលសម្រាប់អ្នកជួល",
];

const CHECKLIST = [
  "មិនមានសៀវភៅ និងកិច្ចសន្យាក្រដាសទៀតទេ។",
  "អ្នកជួលគ្រប់គ្រងខ្លួនឯង។",
  "ទទួលការជូនដំណឹងភ្លាមៗពីកិច្ចសន្យា និងវិក្កយបត្រ។",
];

const KPI_TILES = [
  { label: "បន្ទប់", value: "24", trend: "+2" },
  { label: "អ្នកជួល", value: "18", trend: "+1" },
  { label: "ចំណូល", value: "$2.4k", trend: "+12%" },
  { label: "រង់ចាំ", value: "06", trend: "-3" },
];

const ACTIVITY_ITEMS = [
  {
    icon: CreditCard,
    title: "ទទួលការទូទាត់",
    sub: "បន្ទប់ #012 — $320",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  {
    icon: Wrench,
    title: "សំណើជួសជុល",
    sub: "បន្ទប់ #008 — បំពង់ទឹក",
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/10",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  {
    icon: FileText,
    title: "បន្តកិច្ចសន្យា",
    sub: "បន្ទប់ #003 — ១២ ខែ",
    color: "text-indigo-500 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
    dot: "bg-indigo-500 dark:bg-indigo-400",
  },
];

const REVENUE_BARS = [40, 55, 48, 62, 70, 88];

const NAV_LINKS = [
  { href: "#features", label: "មុខងារ" },
  { href: "#workflow", label: "ដំណើរការ" },
  { href: "#roles", label: "តួនាទី" },
] as const;

function dashboardUrlFor(role: string | null) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "tenant") return "/tenant/dashboard";
  return "/login";
}

function Nav({
  role,
  dashboardUrl,
}: {
  role: string | null;
  dashboardUrl: string;
}) {
  const [activeHash, setActiveHash] = useState<string | null>(null);

  useEffect(() => {
    const sections = NAV_LINKS.map(({ href }) =>
      document.querySelector(href),
    ).filter((el): el is Element => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (mostVisible) {
          setActiveHash(`#${mostVisible.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200/80 dark:border-white/6 bg-white/80 dark:bg-[#04060f]/80 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide text-zinc-900 dark:text-white">
            RRMS
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = activeHash === href;
            return (
              <a
                key={href}
                href={href}
                className={cn(
                  "relative pb-1 transition-colors",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white",
                )}
              >
                {label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-indigo-500 dark:bg-indigo-400"
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={dashboardUrl}
            className="inline-flex items-center gap-2 h-10 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[14px] font-bold transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          >
            {role ? "ផ្ទាំងគ្រប់គ្រង" : "ចូលប្រើប្រាស់"}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function DashboardPreviewCard() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative rounded-[2rem] border border-zinc-200 dark:border-white/8 bg-white dark:bg-[#0d1020] shadow-2xl overflow-hidden"
    >
      {/* Browser bar */}
      <div className="h-10 border-b border-zinc-100 dark:border-white/6 flex items-center px-5 gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>
        <div className="flex-1 mx-4 h-5 rounded-md bg-zinc-100 dark:bg-white/4 flex items-center px-3">
          <span className="text-[10px] text-zinc-500 dark:text-zinc-600">
            app.rrms.io/admin/dashboard
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-600 uppercase tracking-widest">
              ទិដ្ឋភាពទូទៅ
            </p>
            <h3 className="text-base font-bold mt-0.5 text-zinc-900 dark:text-white">
              អរុណសួស្ដី Admin 👋
            </h3>
          </div>
          <div className="h-8 w-8 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <LayoutDashboard
              size={15}
              className="text-indigo-500 dark:text-indigo-400"
            />
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {KPI_TILES.map(({ label, value, trend }) => (
            <div
              key={label}
              className="rounded-xl border border-zinc-100 dark:border-white/6 bg-zinc-50 dark:bg-white/3 p-3"
            >
              <p className="text-[10px] text-zinc-500 dark:text-zinc-600">
                {label}
              </p>
              <p className="text-base font-black mt-1 text-zinc-900 dark:text-white">
                {value}
              </p>
              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-1">
                {trend}
              </p>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mb-3">
            សកម្មភាពថ្មីៗ
          </p>
          {ACTIVITY_ITEMS.map(({ icon: Icon, title, sub, color, bg, dot }) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/2 p-3"
            >
              <div
                className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}
              >
                <Icon size={13} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate text-zinc-900 dark:text-white">
                  {title}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-600">
                  {sub}
                </p>
              </div>
              <div className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            </div>
          ))}
        </div>

        {/* Mini chart */}
        <div className="mt-5 rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/2 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              ចំណូល (៦ ខែ)
            </p>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={12} />
              <span className="text-[10px] font-semibold">+18%</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-10">
            {REVENUE_BARS.map((h, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.6 + i * 0.07, duration: 0.4 }}
                style={{ height: `${h}%`, originY: 1 }}
                className={`flex-1 rounded-sm ${
                  i === REVENUE_BARS.length - 1
                    ? "bg-indigo-500"
                    : "bg-indigo-500/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Hero({
  role,
  dashboardUrl,
  heroRef,
  heroY,
}: {
  role: string | null;
  dashboardUrl: string;
  heroRef: React.RefObject<HTMLElement | null>;
  heroY: MotionValue<number>;
}) {
  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center px-6 pt-40 pb-20"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-175 h-125 bg-indigo-400/10 dark:bg-indigo-700/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-75 h-75 bg-violet-400/10 dark:bg-violet-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-10 w-62.5 h-62.5 bg-cyan-400/10 dark:bg-cyan-600/10 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 text-zinc-900/4 dark:text-white/3"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <motion.div
        style={{ y: heroY }}
        className="relative mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        {/* Left */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-indigo-400/30 dark:border-indigo-400/20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-medium"
          >
            <Sparkles size={12} />
            <span>ប្រព័ន្ធគ្រប់គ្រងបន្ទប់ជួលបែបទំនើប</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-[10px]">
              v2.0
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-[60px] font-black leading-[1.15] tracking-tight text-zinc-900 dark:text-white"
          >
            គ្រប់គ្រងបន្ទប់ជួល
            <br />
            <span className="relative">
              <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-cyan-600 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
                ឆ្លាតវៃ និងទំនើប។
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-linear-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 rounded-full"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-7 max-w-md text-[15px] leading-loose text-zinc-600 dark:text-zinc-400"
          >
            RRMS រួបរួមបន្ទប់ អ្នកជួល កិច្ចសន្យា វិក្កយបត្រ និងសំណើជួសជុល
            ទៅក្នុងវេទិកាសុវត្ថិភាពតែមួយ — ដើម្បីអ្នកចំណាយពេលតិចលើរដ្ឋបាល
            ហើយផ្ដោតលើការពង្រីកអាជីវកម្ម។
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="mt-4 flex flex-col gap-2.5 text-sm text-zinc-600 dark:text-zinc-500"
          >
            {CHECKLIST.map((line) => (
              <div key={line} className="flex items-center gap-2">
                <CheckCircle2
                  size={14}
                  className="text-emerald-500 dark:text-emerald-400 shrink-0"
                />
                <span>{line}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link
              href={dashboardUrl}
              className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[14px] font-bold transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              {role ? "ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រង" : "ចាប់ផ្តើមប្រើប្រាស់ឥឡូវ"}
              <ArrowRight size={15} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-xl border border-zinc-300 dark:border-zinc-700 text-[14px] font-semibold text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
            >
              មើលមុខងារ
            </a>
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 flex items-center gap-8"
          >
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-xl font-black text-zinc-900 dark:text-white">
                  {value}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </motion.div> */}
        </div>

        {/* Right — Dashboard card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-4 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-[2.5rem] blur-[60px]" />

          <DashboardPreviewCard />

          {/* Floating badges */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute -top-4 -right-4 rounded-2xl border border-zinc-200 dark:border-white/8 bg-white dark:bg-[#131828] px-4 py-3 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-amber-500 dark:text-amber-400" />
              <div>
                <p className="text-[11px] font-bold text-zinc-900 dark:text-white">
                  ការទូទាត់ថ្មី
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-600">
                  ទើបតែមាន
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
            className="absolute -bottom-4 -left-4 rounded-2xl border border-zinc-200 dark:border-white/8 bg-white dark:bg-[#131828] px-4 py-3 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={14}
                className="text-emerald-500 dark:text-emerald-400"
              />
              <div>
                <p className="text-[11px] font-bold text-zinc-900 dark:text-white">
                  ការពារទិន្នន័យ
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-600">
                  AES-256
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function TrustBar() {
  return (
    <div className="border-y border-zinc-200 dark:border-white/6 bg-zinc-50 dark:bg-white/2">
      <div className="mx-auto max-w-7xl px-6 py-5 flex flex-wrap items-center justify-center gap-10 text-zinc-500 dark:text-zinc-600 text-xs font-medium tracking-wide">
        {TRUST_ITEMS.map((label) => (
          <div key={label} className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionCard({
  accent,
  children,
}: {
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative rounded-3xl border border-zinc-200 dark:border-white/[0.07] bg-zinc-50 dark:bg-white/2 p-8 overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-white/12 hover:bg-white dark:hover:bg-white/4"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top left, ${accent}10 0%, transparent 60%)`,
        }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-4">
          មុខងារវេទិកា
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="text-4xl md:text-4xl font-black leading-tight tracking-tight max-w-md text-zinc-900 dark:text-white">
            គ្រប់គ្រងបន្ទប់ជួលរបស់អ្នក
            <br />
            <span className="text-zinc-400 dark:text-zinc-500">
              ឆ្លាតវៃ និងទំនើប
            </span>
          </h2>
          <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-500 leading-7">
            RRMS ផ្ដល់នូវមុខងារដែលមានប្រយោជន៍សម្រាប់អ្នកគ្រប់គ្រង និងអ្នកជួល
            ដើម្បីធ្វើឱ្យការគ្រប់គ្រងបន្ទប់ជួលកាន់តែងាយស្រួល និងមានប្រសិទ្ធភាព។
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURES.map(({ icon: Icon, title, sub, desc, accent }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <SectionCard accent={accent}>
              <div
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl mb-6"
                style={{ background: `${accent}18`, color: accent }}
              >
                <Icon size={20} />
              </div>
              <div className="flex items-baseline gap-3 mb-3">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {title}
                </h3>
                <span className="text-xs text-zinc-400 dark:text-zinc-600">
                  {sub}
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-7">
                {desc}
              </p>
            </SectionCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section id="workflow" className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-[2.5rem] border border-zinc-200 dark:border-white/[0.07] bg-zinc-50 dark:bg-white/2 p-10 md:p-14 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-50 bg-indigo-400/10 dark:bg-indigo-700/10 blur-[80px] pointer-events-none" />

        <div className="relative">
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-4">
            របៀបដំណើរការ
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-14 text-zinc-900 dark:text-white">
            បួនជំហានទៅកាន់ការគ្រប់គ្រងពេញលេញ។
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {WORKFLOW.map(({ step, title, sub, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {i < WORKFLOW.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(100%+12px)] right-0 w-full h-px bg-linear-to-r from-zinc-300 dark:from-zinc-700 to-transparent" />
                )}
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-black mb-5">
                  {step}
                </div>
                <h3 className="font-bold text-[15px] text-zinc-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-0.5 mb-3">
                  {sub}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-6">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RoleCard({ role }: { role: (typeof ROLES)[number] }) {
  const {
    role: r,
    khmer,
    icon: Icon,
    accent,
    desc,
    perks,
    cta,
    ctaLabel,
  } = role;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-zinc-200 dark:border-white/[0.07] bg-zinc-50 dark:bg-white/2 p-8 relative overflow-hidden group transition-all hover:border-zinc-300 dark:hover:border-white/12"
    >
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-10 dark:opacity-20 pointer-events-none"
        style={{ background: accent }}
      />
      <div className="relative">
        <div
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-6"
          style={{ background: `${accent}18`, color: accent }}
        >
          <Icon size={22} />
        </div>
        <div className="flex items-baseline gap-3 mb-3">
          <h3 className="text-xl font-black text-zinc-900 dark:text-white">
            {khmer}
          </h3>
          <span className="text-sm text-zinc-500 dark:text-zinc-600">{r}</span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-7 mb-6">
          {desc}
        </p>
        <ul className="space-y-2 mb-8">
          {perks.map((perk) => (
            <li
              key={perk}
              className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
            >
              <CheckCircle2
                size={14}
                style={{ color: accent }}
                className="shrink-0"
              />
              {perk}
            </li>
          ))}
        </ul>
        <Link
          href={cta}
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: accent }}
        >
          {ctaLabel} <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

function Roles() {
  return (
    <section id="roles" className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 text-center"
      >
        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-4">
          សិទ្ធិប្រើប្រាស់
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
          សាងសង់សម្រាប់អ្នកប្រើពីរប្រភេទ។
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ROLES.map((role) => (
          <RoleCard key={role.role} role={role} />
        ))}
      </div>
    </section>
  );
}

function CTA({
  role,
  dashboardUrl,
}: {
  role: string | null;
  dashboardUrl: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[2.5rem] bg-linear-to-br from-indigo-100 via-indigo-50 to-violet-100 dark:from-indigo-900/60 dark:via-indigo-800/30 dark:to-violet-900/40 border border-indigo-200 dark:border-indigo-500/20 p-12 md:p-16 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-t from-white dark:from-[#04060f] to-transparent pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
            <Zap size={12} />
            ត្រៀមធ្វើឱ្យការងាររបស់អ្នកកាន់តែប្រសើរឡើងហើយឬ?
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5 text-zinc-900 dark:text-white">
            ចាប់ផ្តើមគ្រប់គ្រងប្រកបដោយ
            <br />
            <span className="text-zinc-500 dark:text-zinc-400">
              ភាពឆ្លាតវៃ ចាប់ពីថ្ងៃនេះ។
            </span>
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-500 max-w-md mx-auto leading-7 mb-10">
            ចូលរួមជាមួយម្ចាស់អចលនទ្រព្យទូទាំងកម្ពុជា ដែលកំពុងប្រើ RRMS
            ដើម្បីលុបបំបាត់ការងារក្រដាស និងពង្រីកអាជីវកម្មដោយទំនុកចិត្ត។
          </p>
          <Link
            href={dashboardUrl}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-[14px] font-bold transition-all shadow-2xl shadow-zinc-900/10 dark:shadow-white/10 hover:-translate-y-0.5"
          >
            {role ? "ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រង" : "ចាប់ផ្តើមឥឡូវ — ឥតគិតថ្លៃ"}
            <ArrowRight size={15} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-white/6 px-6 py-10">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Building2 size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-zinc-900 dark:text-white">
            RRMS
          </span>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-700">
          © ២០២៦ ប្រព័ន្ធគ្រប់គ្រងបន្ទប់ជួល។ សាងសង់នៅក្នុងប្រទេសកម្ពុជា។
        </p>
        <div className="flex gap-6 text-xs text-zinc-500 dark:text-zinc-700">
          <a
            href="#"
            className="hover:text-zinc-900 dark:hover:text-zinc-400 transition-colors"
          >
            ភាពឯកជន
          </a>
          <a
            href="#"
            className="hover:text-zinc-900 dark:hover:text-zinc-400 transition-colors"
          >
            លក្ខខណ្ឌ
          </a>
          <a
            href="#"
            className="hover:text-zinc-900 dark:hover:text-zinc-400 transition-colors"
          >
            ជំនួយ
          </a>
        </div>
      </div>
    </footer>
  );
}

export function LandingPageClient({ role }: { role: string | null }) {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const dashboardUrl = dashboardUrlFor(role);

  return (
    <main className="min-h-screen bg-white dark:bg-[#04060f] text-zinc-900 dark:text-white overflow-hidden transition-colors duration-300">
      <Nav role={role} dashboardUrl={dashboardUrl} />
      <Hero
        role={role}
        dashboardUrl={dashboardUrl}
        heroRef={heroRef}
        heroY={heroY}
      />
      <TrustBar />
      <Features />
      <Workflow />
      <Roles />
      <CTA role={role} dashboardUrl={dashboardUrl} />
      <Footer />
    </main>
  );
}
