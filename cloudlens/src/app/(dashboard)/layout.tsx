import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "./DashboardShell";
import { NotificationBellServer } from "@/components/NotificationBellServer";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <DashboardShell
      userName={session.user.name}
      userImage={session.user.image}
      notificationBell={<NotificationBellServer />}
    >
      {children}
    </DashboardShell>
  );
}
