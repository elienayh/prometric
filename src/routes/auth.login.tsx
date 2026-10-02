import { createFileRoute, redirect } from "@tanstack/react-router";

// Rota legada — redireciona para a rota oficial /login
export const Route = createFileRoute("/auth/login")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
});
