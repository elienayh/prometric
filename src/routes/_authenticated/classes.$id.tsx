import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout da turma. As telas filhas são:
 *  - `/classes/$id`            → lista de alunos da turma (abrir turma)
 *  - `/classes/$id/dashboard`  → resumo/dashboard com indicadores da turma
 */
export const Route = createFileRoute("/_authenticated/classes/$id")({
  component: () => <Outlet />,
  errorComponent: ({ error }) => <div className="p-6 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-6 text-sm">Turma não encontrada.</div>,
});
