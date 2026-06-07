import {
  getAdminProfileAction,
  getPropertySettingsAction,
  getBillingSettingsAction,
} from "@/actions/settings";
import SettingsClient from "@/components/setting/setting-client";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [profileResult, propertyResult, billingResult] = await Promise.all([
    getAdminProfileAction(),
    getPropertySettingsAction(),
    getBillingSettingsAction(),
  ]);

  const initialProfile = profileResult.data ?? {
    fullName: "",
    phoneNumber: "",
    email: "",
  };

  const initialProperty = propertyResult.data ?? {
    buildingName: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
    description: "",
  };

  const initialBilling = billingResult.data ?? {
    waterPricePerUnit: "0.5",
    elecPricePerUnit: "0.1",
    defaultDueDay: "5",
    currency: "USD",
  };

  return (
    <div className="w-full min-h-screen p-1 md:p-6">
      <SettingsClient
        initialProfile={initialProfile}
        initialProperty={initialProperty}
        initialBilling={initialBilling}
      />
    </div>
  );
}
