import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout de Grupos. Necessário para que as rotas filhas
 * (`/groups/$id` e `/groups/$id/dashboard`) sejam renderizadas.
 */
export const Route = createFileRoute("/_authenticated/groups")({
  component: () => <Outlet />,
});
