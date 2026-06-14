"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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

export function LandingPageClient({ role }: { role: string | null }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const dashboardUrl =
    role === "admin"
      ? "/admin/dashboard"
      : role === "tenant"
        ? "/tenant/dashboard"
        : "/login";

  const stats = [
    { value: "99.9%", label: "ម៉ោងដំណើរការ" },
    { value: "< 2s", label: "ល្បឿនឆ្លើយតប" },
    { value: "256-bit", label: "ការការពារទិន្នន័យ" },
  ];

  const features = [
    {
      icon: Building2,
      title: "គ្រប់គ្រងបន្ទប់",
      sub: "Room Management",
      desc: "តាមដានបន្ទប់ទំនេរ និងបន្ទប់មានអ្នកជួលក្នុងពេលវេលាជាក់ស្ដែង ជាមួយការអាប់ដេតស្ថានភាពភ្លាមៗ។",
      accent: "#6366f1",
    },
    {
      icon: FileText,
      title: "កិច្ចសន្យាឆ្លាតវៃ",
      sub: "Smart Contracts",
      desc: "កិច្ចសន្យាជួលឌីជីថល ជាមួយការស្នាម៉ឺនអេឡិចត្រូនិក ការជូនដំណឹងបន្តកិច្ចសន្យា និងការរក្សាទុកឯកសារយ៉ាងមានសុវត្ថិភាព។",
      accent: "#8b5cf6",
    },
    {
      icon: CreditCard,
      title: "ប្រព័ន្ធទូទាត់",
      sub: "Payment Flows",
      desc: "ទទួលការទូទាត់តាម QR Code ជាមួយដំណើរការអនុម័តដោយ Admin និងមានកំណត់ត្រាពេញលេញ។",
      accent: "#06b6d4",
    },
    {
      icon: Wrench,
      title: "មជ្ឈមណ្ឌលជួសជុល",
      sub: "Maintenance Hub",
      desc: "អ្នកជួលដាក់សំណើក្នុងពេលប៉ុន្មានវិនាទី។ Admin ត្រួតពិនិត្យ ចាត់ចែង និងដោះស្រាយ — គ្រប់យ៉ាងនៅកន្លែងតែមួយ។",
      accent: "#10b981",
    },
  ];

  const workflow = [
    {
      step: "០១",
      title: "បន្ថែមបន្ទប់",
      sub: "Add Rooms",
      desc: "រៀបចំអចលនទ្រព្យរបស់អ្នកជាមួយផ្ទៃដី និងតម្លៃជួល។",
    },
    {
      step: "០២",
      title: "ចុះឈ្មោះអ្នកជួល",
      sub: "Onboard Tenants",
      desc: "បង្កើតប្រវត្តិរូប ផ្ទុកអត្តសញ្ញាណបណ្ណ និងចាត់ចែងបន្ទប់ក្នុងពេលតិចជាងមួយនាទី។",
    },
    {
      step: "០៣",
      title: "បង្កើតវិក្កយបត្រ",
      sub: "Generate Bills",
      desc: "វិក្កយបត្រប្រចាំខែស្វ័យប្រវត្តិ ជាមួយធាតុប្រើប្រាស់ទឹកភ្លើងតាមតម្រូវការ។",
    },
    {
      step: "០៤",
      title: "ទទួលការទូទាត់",
      sub: "Collect & Close",
      desc: "ទទួលការទូទាត់តាម QR បញ្ជាក់វិក្កយបត្រ និងបិទវដ្ដប្រចាំខែ។",
    },
  ];

  return (
    <main
      className="min-h-screen bg-[#04060f] text-white overflow-hidden"
      style={{ fontFamily: "'Hanuman', 'Inter', system-ui, sans-serif" }}
    >
      {/* ── Nav ── */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#04060f] to-transparent pointer-events-none" />
          <Link href="/" className="relative flex items-center gap-3 z-10">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <Building2 size={18} />
            </div>
            <span className="font-bold text-sm tracking-wide">RRMS</span>
          </Link>

          <nav className="relative z-10 hidden md:flex items-center gap-8 text-[13px] font-medium text-zinc-500">
            {[
              ["#features", "មុខងារ"],
              ["#workflow", "ដំណើរការ"],
              ["#roles", "តួនាទី"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="hover:text-white transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>

          <Link
            href={dashboardUrl}
            className="relative z-10 inline-flex items-center gap-2 h-9 px-5 rounded-xl text-[13px] font-semibold bg-white text-zinc-950 hover:bg-zinc-100 transition-colors shadow-lg shadow-white/10"
          >
            {role ? "ផ្ទាំងគ្រប់គ្រង" : "ចូលប្រើប្រាស់"}
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center px-6 pt-40 pb-20"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-700/20 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-violet-600/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 left-10 w-[250px] h-[250px] bg-cyan-600/10 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
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
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 text-indigo-300 text-xs font-medium"
            >
              <Sparkles size={12} />
              <span>ប្រព័ន្ធគ្រប់គ្រងបន្ទប់ជួលបែបទំនើប</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-[10px]">
                v2.0
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-[60px] font-black leading-[1.15] tracking-tight"
            >
              គ្រប់គ្រងបន្ទប់ជួល
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  ឆ្លាតវៃ និងទំនើប។
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full"
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
              className="mt-7 max-w-md text-[15px] leading-[2] text-zinc-400"
            >
              RRMS រួបរួមបន្ទប់ អ្នកជួល កិច្ចសន្យា វិក្កយបត្រ និងសំណើជួសជុល
              ទៅក្នុងវេទិកាសុវត្ថិភាពតែមួយ — ដើម្បីអ្នកចំណាយពេលតិចលើរដ្ឋបាល
              ហើយផ្ដោតលើការពង្រីកអាជីវកម្ម។
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="mt-4 flex flex-col gap-2.5 text-sm text-zinc-500"
            >
              {[
                "មិនមានសៀវភៅ និងកិច្ចសន្យាក្រដាសទៀតទេ។",
                "អ្នកជួលគ្រប់គ្រងខ្លួនឯង។ អ្នកទទួលបានការគ្រប់គ្រង។",
                "ដំណើរការបានគ្រប់ឧបករណ៍ គ្រប់ពេលវេលា។",
              ].map((line) => (
                <div key={line} className="flex items-center gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-400 flex-shrink-0"
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
                className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[14px] font-bold transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                {role ? "ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រង" : "ចាប់ផ្តើមប្រើប្រាស់ឥឡូវ"}
                <ArrowRight size={15} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-xl border border-zinc-700 text-[14px] font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-all"
              >
                មើលមុខងារ
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12 flex items-center gap-8"
            >
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Dashboard card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-4 bg-indigo-600/20 rounded-[2.5rem] blur-[60px]" />

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-[2rem] border border-white/[0.08] bg-[#0d1020] shadow-2xl overflow-hidden"
            >
              {/* Browser bar */}
              <div className="h-10 border-b border-white/[0.06] flex items-center px-5 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <div className="flex-1 mx-4 h-5 rounded-md bg-white/[0.04] flex items-center px-3">
                  <span className="text-[10px] text-zinc-600">
                    app.rrms.io/admin/dashboard
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-widest">
                      ទិដ្ឋភាពទូទៅ
                    </p>
                    <h3 className="text-base font-bold mt-0.5">
                      អរុណសួស្ដី Admin 👋
                    </h3>
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                    <LayoutDashboard size={15} className="text-indigo-400" />
                  </div>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {[
                    { label: "បន្ទប់", value: "24", trend: "+2" },
                    { label: "អ្នកជួល", value: "18", trend: "+1" },
                    { label: "ចំណូល", value: "$2.4k", trend: "+12%" },
                    { label: "រង់ចាំ", value: "06", trend: "-3" },
                  ].map(({ label, value, trend }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
                    >
                      <p className="text-[10px] text-zinc-600">{label}</p>
                      <p className="text-base font-black mt-1">{value}</p>
                      <p className="text-[9px] text-emerald-400 mt-1">
                        {trend}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Activity */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-3">
                    សកម្មភាពថ្មីៗ
                  </p>
                  {[
                    {
                      icon: CreditCard,
                      title: "ទទួលការទូទាត់",
                      sub: "បន្ទប់ #012 — $320",
                      color: "text-emerald-400",
                      bg: "bg-emerald-400/10",
                      dot: "bg-emerald-400",
                    },
                    {
                      icon: Wrench,
                      title: "សំណើជួសជុល",
                      sub: "បន្ទប់ #008 — បំពង់ទឹក",
                      color: "text-amber-400",
                      bg: "bg-amber-400/10",
                      dot: "bg-amber-400",
                    },
                    {
                      icon: FileText,
                      title: "បន្តកិច្ចសន្យា",
                      sub: "បន្ទប់ #003 — ១២ ខែ",
                      color: "text-indigo-400",
                      bg: "bg-indigo-400/10",
                      dot: "bg-indigo-400",
                    },
                  ].map(({ icon: Icon, title, sub, color, bg, dot }) => (
                    <div
                      key={title}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                    >
                      <div
                        className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon size={13} className={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold truncate">
                          {title}
                        </p>
                        <p className="text-[10px] text-zinc-600">{sub}</p>
                      </div>
                      <div className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                    </div>
                  ))}
                </div>

                {/* Mini chart */}
                <div className="mt-5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold text-zinc-400">
                      ចំណូល (៦ ខែ)
                    </p>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp size={12} />
                      <span className="text-[10px] font-semibold">+18%</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-1.5 h-10">
                    {[40, 55, 48, 62, 70, 88].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.6 + i * 0.07, duration: 0.4 }}
                        style={{ height: `${h}%`, originY: 1 }}
                        className={`flex-1 rounded-sm ${i === 5 ? "bg-indigo-500" : "bg-indigo-500/25"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -top-4 -right-4 rounded-2xl border border-white/[0.08] bg-[#131828] px-4 py-3 shadow-2xl"
            >
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-amber-400" />
                <div>
                  <p className="text-[11px] font-bold">ការទូទាត់ថ្មី</p>
                  <p className="text-[10px] text-zinc-600">ទើបតែមាន</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-4 -left-4 rounded-2xl border border-white/[0.08] bg-[#131828] px-4 py-3 shadow-2xl"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <div>
                  <p className="text-[11px] font-bold">ការពារទិន្នន័យ</p>
                  <p className="text-[10px] text-zinc-600">AES-256</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Trust bar ── */}
      <div className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-wrap items-center justify-center gap-10 text-zinc-600 text-xs font-medium tracking-wide">
          {[
            "សុវត្ថិភាពតាំងពីដំបូង",
            "ត្រៀមរួចសម្រាប់ GDPR",
            "ដំណើរការ 99.9%",
            "ធ្វើសមកាលកម្មផ្ទាល់",
            "ប្រើបានលើទូរស័ព្ទ",
          ].map((label) => (
            <div key={label} className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-zinc-700" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">
            មុខងារវេទិកា
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight max-w-md">
              គ្រប់អ្វីដែលអចលនទ្រព្យ
              <br />
              <span className="text-zinc-500">របស់អ្នកត្រូវការ។</span>
            </h2>
            <p className="max-w-xs text-sm text-zinc-500 leading-7">
              សាងសង់សម្រាប់ម្ចាស់អចលនទ្រព្យនៅកម្ពុជា
              ដែលត្រៀមឈប់គ្រប់គ្រងភាពស្មុគ្រស្មាញ ហើយចង់ពង្រីកការវិនិយោគ។
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, sub, desc, accent }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative rounded-3xl border border-white/[0.07] bg-white/[0.02] p-8 overflow-hidden transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top left, ${accent}10 0%, transparent 60%)`,
                }}
              />
              <div className="relative">
                <div
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl mb-6"
                  style={{ background: `${accent}18`, color: accent }}
                >
                  <Icon size={20} />
                </div>
                <div className="flex items-baseline gap-3 mb-3">
                  <h3 className="text-base font-bold">{title}</h3>
                  <span className="text-xs text-zinc-600">{sub}</span>
                </div>
                <p className="text-sm text-zinc-500 leading-7">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Workflow ── */}
      <section id="workflow" className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2.5rem] border border-white/[0.07] bg-white/[0.02] p-10 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-indigo-700/10 blur-[80px] pointer-events-none" />

          <div className="relative">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">
              របៀបដំណើរការ
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-14">
              បួនជំហានទៅកាន់ការគ្រប់គ្រងពេញលេញ។
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {workflow.map(({ step, title, sub, desc }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  {i < workflow.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-[calc(100%+12px)] right-0 w-full h-px bg-gradient-to-r from-zinc-700 to-transparent" />
                  )}
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-black mb-5">
                    {step}
                  </div>
                  <h3 className="font-bold text-[15px]">{title}</h3>
                  <p className="text-xs text-zinc-600 mt-0.5 mb-3">{sub}</p>
                  <p className="text-sm text-zinc-500 leading-6">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="roles" className="mx-auto max-w-7xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">
            សិទ្ធិប្រើប្រាស់
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            សាងសង់សម្រាប់អ្នកប្រើពីរប្រភេទ។
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              role: "Admin",
              khmer: "អ្នកគ្រប់គ្រង",
              icon: Users,
              accent: "#6366f1",
              desc: "ការគ្រប់គ្រងពេញលេញលើបន្ទប់ កិច្ចសន្យា ការគិតថ្លៃ និងការថែទាំ។ អនុម័តការទូទាត់ បង្កើតរបាយការណ៍ និងគ្រប់គ្រងអចលនទ្រព្យទាំងមូលពីផ្ទាំងគ្រប់គ្រងតែមួយ។",
              perks: [
                "គ្រប់គ្រងបន្ទប់ និងអ្នកជួល",
                "ដំណើរការអនុម័តការទូទាត់",
                "ត្រួតពិនិត្យការជួសជុល",
                "វិភាគចំណូល",
              ],
              cta: "/admin/dashboard",
              ctaLabel: "ចូលប្រើ Admin Portal",
            },
            {
              role: "Tenant",
              khmer: "អ្នកជួល",
              icon: ShieldCheck,
              accent: "#10b981",
              desc: "វិបផតថលច្បាស់លាស់ ងាយស្រួល ដើម្បីបង់ថ្លៃជួល មើលកិច្ចសន្យា តាមដានសំណើជួសជុល និងទទួលការជូនដំណឹង — មិនចាំបាច់ទូរស័ព្ទទេ។",
              perks: [
                "បង់ថ្លៃជួលតាម QR Code",
                "មើល និងចុះហត្ថលេខាកិច្ចសន្យា",
                "ដាក់សំណើជួសជុល",
                "ជូនដំណឹងផ្ទាល់ពេល",
              ],
              cta: "/tenant/dashboard",
              ctaLabel: "ចូលប្រើ Tenant Portal",
            },
          ].map(
            ({
              role: r,
              khmer,
              icon: Icon,
              accent,
              desc,
              perks,
              cta,
              ctaLabel,
            }) => (
              <motion.div
                key={r}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-8 relative overflow-hidden group transition-all hover:border-white/[0.12]"
              >
                <div
                  className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none"
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
                    <h3 className="text-xl font-black">{khmer}</h3>
                    <span className="text-sm text-zinc-600">{r}</span>
                  </div>
                  <p className="text-sm text-zinc-500 leading-7 mb-6">{desc}</p>
                  <ul className="space-y-2 mb-8">
                    {perks.map((perk) => (
                      <li
                        key={perk}
                        className="flex items-center gap-2 text-sm text-zinc-400"
                      >
                        <CheckCircle2
                          size={14}
                          style={{ color: accent }}
                          className="flex-shrink-0"
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
            ),
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-7xl px-6 py-16 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2.5rem] bg-gradient-to-br from-indigo-900/60 via-indigo-800/30 to-violet-900/40 border border-indigo-500/20 p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#04060f] to-transparent pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Zap size={12} />
              ត្រៀមធ្វើឱ្យការងាររបស់អ្នកកាន់តែប្រសើរឡើងហើយឬ?
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">
              ចាប់ផ្តើមគ្រប់គ្រងប្រកបដោយ
              <br />
              <span className="text-zinc-400">ភាពឆ្លាតវៃ ចាប់ពីថ្ងៃនេះ។</span>
            </h2>
            <p className="text-sm text-zinc-500 max-w-md mx-auto leading-7 mb-10">
              ចូលរួមជាមួយម្ចាស់អចលនទ្រព្យទូទាំងកម្ពុជា ដែលកំពុងប្រើ RRMS
              ដើម្បីលុបបំបាត់ការងារក្រដាស និងពង្រីកអាជីវកម្មដោយទំនុកចិត្ត។
            </p>
            <Link
              href={dashboardUrl}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-zinc-950 text-[14px] font-bold hover:bg-zinc-100 transition-all shadow-2xl shadow-white/10 hover:-translate-y-0.5"
            >
              {role ? "ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រង" : "ចាប់ផ្តើមឥឡូវ — ឥតគិតថ្លៃ"}
              <ArrowRight size={15} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] px-6 py-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Building2 size={14} />
            </div>
            <span className="text-sm font-bold">RRMS</span>
          </div>
          <p className="text-xs text-zinc-700">
            © ២០២៦ ប្រព័ន្ធគ្រប់គ្រងបន្ទប់ជួល។ សាងសង់នៅក្នុងប្រទេសកម្ពុជា។
          </p>
          <div className="flex gap-6 text-xs text-zinc-700">
            <a href="#" className="hover:text-zinc-400 transition-colors">
              ភាពឯកជន
            </a>
            <a href="#" className="hover:text-zinc-400 transition-colors">
              លក្ខខណ្ឌ
            </a>
            <a href="#" className="hover:text-zinc-400 transition-colors">
              ជំនួយ
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
