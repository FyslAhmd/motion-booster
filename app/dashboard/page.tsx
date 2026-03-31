"use client";

import { useAuth } from "@/lib/auth/context";
import AdminDashboardView from "./_components/AdminDashboardView";
import ClientDashboardView from "./_components/ClientDashboardView";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return isAdmin ? <AdminDashboardView /> : <ClientDashboardView />;
}
