import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Painel Administrativo — ProMetric" }] }),
  component: AdminDashboard,
});
