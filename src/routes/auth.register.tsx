import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "./auth";

export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "Criar Conta — ProMetric" }] }),
  component: () => <AuthScreen initialMode="signup" />,
});