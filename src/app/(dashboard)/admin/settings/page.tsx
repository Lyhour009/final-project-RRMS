import { getSettings } from "@/actions/settings";
import SettingsForm from "@/components/setting/setting-form";
import { AlertTriangle } from "lucide-react";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  if (!settings) {
    return (
      <div className="mx-auto w-full max-w-[1680px] p-4 text-(--panel-text) sm:p-6 lg:p-8">
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-(--panel-border) bg-(--panel) px-6 text-center">
          <div className="mb-4 rounded-2xl bg-red-500/10 p-4 text-red-500"><AlertTriangle className="h-7 w-7" /></div>
          <h1 className="text-lg font-semibold">រកមិនឃើញការកំណត់ប្រព័ន្ធ</h1>
          <p className="mt-1 text-sm text-(--panel-text-muted)">សូមពិនិត្យតារាង Settings ក្នុង Database។</p>
        </div>
      </div>
    );
  }

  return <SettingsForm settings={settings} />;
}
