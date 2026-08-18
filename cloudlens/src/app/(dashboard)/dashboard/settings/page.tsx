import { auth } from "@/lib/auth";
import { SettingsClient } from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-headline text-ink">Settings</h1>
        <p className="text-body-sm text-ink-muted mt-1">
          Manage your profile, connected accounts, and notification preferences.
        </p>
      </div>

      {/* Client-side interactive settings */}
      <SettingsClient
        userName={session?.user?.name}
        userEmail={session?.user?.email}
        userImage={session?.user?.image}
      />
    </div>
  );
}
