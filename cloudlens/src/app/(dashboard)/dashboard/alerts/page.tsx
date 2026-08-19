import { auth } from "@/lib/auth";
import { db } from "@/db";
import { alerts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AlertsClient } from "@/components/AlertsClient";
import type { AlertItem } from "@/components/NotificationBell";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const session = await auth();
  if (!session?.user) return null;

  let dbUserId = (session.user as any).id;
  if (!dbUserId && session.user.email) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    dbUserId = dbUser?.id;
  }

  const rawAlerts = dbUserId
    ? await db
        .select({
          id: alerts.id,
          type: alerts.type,
          severity: alerts.severity,
          title: alerts.title,
          message: alerts.message,
          status: alerts.status,
          createdAt: alerts.createdAt,
        })
        .from(alerts)
        .where(eq(alerts.userId, dbUserId))
        .orderBy(desc(alerts.createdAt))
        .limit(200)
    : [];

  const items: AlertItem[] = rawAlerts.map((a) => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    title: a.title,
    message: a.message,
    status: a.status,
    createdAt: a.createdAt,
  }));

  const activeCount = items.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-headline text-ink">Alerts</h1>
          {activeCount > 0 && (
            <span className="text-[12px] font-bold text-white bg-semantic-error rounded-full px-2 py-0.5 leading-none">
              {activeCount}
            </span>
          )}
        </div>
        <p className="text-body-sm text-ink-muted mt-1">
          Smart notifications about your cloud services — inactivity, expiry warnings, and outages.
        </p>
      </div>

      <AlertsClient initialAlerts={items} />
    </div>
  );
}
