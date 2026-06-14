import { AlertTriangle, CreditCard, FileText, Wrench } from "lucide-react";

function ActionCard({
  title,
  value,
  description,
  icon,
  tone,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  tone: "amber" | "red" | "blue" | "purple";
}) {
  const map = {
    amber: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    red: "border-red-500/30 bg-red-500/5 text-red-400",
    blue: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    purple: "border-purple-500/30 bg-purple-500/5 text-purple-400",
  };

  return (
    <div className={`rounded-2xl border p-5 ${map[tone]}`}>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-black/20 p-3">{icon}</div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
      </div>
      <p className="text-xs text-zinc-400 mt-3">{description}</p>
    </div>
  );
}

export function DashboardActionCards({ cards }: { cards: any }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#131626] p-5">
      <h2 className="text-lg font-semibold text-white mb-4">
        ការងារត្រូវតាមដាន
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <ActionCard
          title="ការទូទាត់រង់ចាំ"
          value={cards.pendingPayments}
          description="Admin ត្រូវពិនិត្យ និងអនុម័ត"
          icon={<CreditCard size={22} />}
          tone="amber"
        />

        <ActionCard
          title="វិក្កយបត្រមិនទាន់បង់"
          value={cards.unpaidBills}
          description={`ទឹកប្រាក់សរុប $${cards.unpaidAmount.toFixed(2)}`}
          icon={<AlertTriangle size={22} />}
          tone="red"
        />

        <ActionCard
          title="កិច្ចសន្យាជិតផុត"
          value={cards.contractsEndingSoon}
          description="កិច្ចសន្យាដែលនឹងផុតក្នុង 30 ថ្ងៃ"
          icon={<FileText size={22} />}
          tone="blue"
        />

        <ActionCard
          title="សំណើជួសជុល"
          value={cards.maintenancePending}
          description="សំណើដែលកំពុងរង់ចាំ"
          icon={<Wrench size={22} />}
          tone="purple"
        />
      </div>
    </div>
  );
}
