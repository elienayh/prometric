import { createFileRoute } from "@tanstack/react-router";
import { PortalAluno } from "./portal.aluno.$token";

export const Route = createFileRoute("/p/$slug")({
  head: () => ({ meta: [{ title: "Portal do Aluno — ProMetric" }] }),
  component: PortalSlugRoute,
});

function PortalSlugRoute() {
  const { slug } = Route.useParams();
  return <PortalAluno lookupKey={slug} />;
}
