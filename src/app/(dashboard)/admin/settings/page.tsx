import { getSettings } from "@/actions/settings";
import SettingsForm from "@/components/setting/setting-form";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  if (!settings) {
    return (
      <div className="p-6 text-(--panel-text)">
        <h1 className="text-2xl font-bold">⚙️ ការកំណត់ប្រព័ន្ធ</h1>
        <p className="mt-4 text-sm text-red-400">
          មិនមាន Settings row ក្នុង Database ទេ។
        </p>
      </div>
    );
  }

  return <SettingsForm settings={settings} />;
}
