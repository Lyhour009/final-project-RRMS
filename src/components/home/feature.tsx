import {
  Building2,
  ShieldCheck,
  Zap,
  Bell,
  FileText,
  Wrench,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "គ្រប់គ្រងកិច្ចសន្យា",
    desc: "ចុះហត្ថលេខា ពន្យារ និងតាមដានកិច្ចសន្យាជួលបន្ទប់ដោយងាយ",
  },
  {
    icon: Zap,
    title: "វិក្កយបត្រស្វ័យប្រវត្តិ",
    desc: "ប្រព័ន្ធគណនាថ្លៃទឹក ភ្លើង និងថ្លៃបន្ទប់ដោយស្វ័យប្រវត្តិរៀងរាល់ខែ",
  },
  {
    icon: Bell,
    title: "ការជូនដំណឹង",
    desc: "ទទួលការជូនដំណឹងភ្លាមៗ នៅពេលមានវិក្កយបត្រ ឬការផ្លាស់ប្តូរ",
  },
  {
    icon: Wrench,
    title: "សំណើជួសជុល",
    desc: "ដាក់ពាក្យសុំជួសជុល និងតាមដានស្ថានភាពបន្ទប់ពេលវេលាពិតប្រាកដ",
  },
  {
    icon: ShieldCheck,
    title: "សុវត្ថិភាពទិន្នន័យ",
    desc: "ព័ត៌មានរបស់អ្នកត្រូវបានការពារដោយប្រព័ន្ធ Supabase Auth",
  },
  {
    icon: Building2,
    title: "គ្រប់គ្រងបន្ទប់",
    desc: "ឃើញស្ថានភាពបន្ទប់ ការតុបតែង និងព័ត៌មានលម្អិតទាំងអស់",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative z-10 max-w-6xl mx-auto px-6 pb-24"
    >
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-white mb-3">លក្ខណៈពិសេស</h2>
        <p className="text-slate-500 text-sm">
          អ្វីៗដែលអ្នកត្រូវការ នៅក្នុងប្រព័ន្ធតែមួយ
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-indigo-500/25 rounded-xl p-5 transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
              <f.icon className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5">
              {f.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
