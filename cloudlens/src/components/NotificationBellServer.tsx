import { auth } from "@/lib/auth";
import { db } from "@/db";
import { alerts, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { NotificationBell, type AlertItem } from "@/components/NotificationBell";

/**
 * Server component wrapper for NotificationBell.
 * Fetches the current user's active alerts and passes them as props.
 */
export async function NotificationBellServer() {
  const session = await auth();
  if (!session?.user) return null;

  let dbUserId = (session.user as any).id;
  if (!dbUserId && session.user.email) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    dbUserId = dbUser?.id;
  }

  if (!dbUserId) return null;

  const rawAlerts = await db
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
    .where(and(eq(alerts.userId, dbUserId), eq(alerts.status, "active")))
    .orderBy(desc(alerts.createdAt))
    .limit(20);

  const items: AlertItem[] = rawAlerts.map((a) => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    title: a.title,
    message: a.message,
    status: a.status,
    createdAt: a.createdAt,
  }));

  return <NotificationBell initialAlerts={items} />;
}
