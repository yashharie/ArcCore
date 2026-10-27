// Member layout — wraps all /dashboard/* pages with the sidebar shell
import { requireAuth } from "@/lib/auth/authorization";
import MemberShellLayout from "./MemberShellLayout";

export const instant = false;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  return <MemberShellLayout user={user}>{children}</MemberShellLayout>;
}
