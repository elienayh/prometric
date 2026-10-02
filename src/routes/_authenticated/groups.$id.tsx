import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout do grupo. As telas filhas são:
 *  - `/groups/$id`            → participantes do grupo (abrir grupo)
 *  - `/groups/$id/dashboard`  → resumo/dashboard com indicadores do grupo
 */
export const Route = createFileRoute("/_authenticated/groups/$id")({
  component: () => <Outlet />,
  errorComponent: ({ error }) => <div className="p-6 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-6 text-sm">Grupo não encontrado.</div>,
});
