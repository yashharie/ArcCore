import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import AdminUserTable from "../AdminUserTable";

export const metadata: Metadata = { title: "Manage Users — ArcCore Admin" };
export const instant = false;

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      mustChangePassword: true, createdAt: true,
      _count: { select: { attempts: true, topics: true, quizzesCreated: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const currentUser = await (await import("@/lib/auth/getCurrentUser")).getCurrentUser();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-white">User Management</h1>
        <p className="text-xs text-[#94b8d8] mt-0.5">{users.length} total members</p>
      </div>
      <div className="arc-card overflow-hidden">
        <AdminUserTable users={users} currentUserId={currentUser?.id ?? ""} />
      </div>
    </div>
  );
}
