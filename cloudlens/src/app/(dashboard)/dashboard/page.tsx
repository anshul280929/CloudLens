import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[rgba(178,182,189,0.1)] bg-surface-1 p-6">
        <h2 className="text-subhead text-ink mb-1">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}!
        </h2>
        <p className="text-body-sm text-ink-muted">
          Your dashboard is ready. Start by syncing your repositories.
        </p>
      </div>
    </div>
  );
}
