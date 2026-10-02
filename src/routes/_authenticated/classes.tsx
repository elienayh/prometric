import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout de Turmas. Necessário para que as rotas filhas
 * (`/classes/$id` e `/classes/$id/dashboard`) sejam renderizadas.
 */
export const Route = createFileRoute("/_authenticated/classes")({
  component: () => <Outlet />,
});
