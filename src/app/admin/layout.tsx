// Admin layout — sidebar + topbar, no shared Nav (admin has its own)
import { requireAdmin } from "@/lib/auth/authorization";
import AdminShell from "./AdminShell";

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <AdminShell user={user}>{children}</AdminShell>;
}
