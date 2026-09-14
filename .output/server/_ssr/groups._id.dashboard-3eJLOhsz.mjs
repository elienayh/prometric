import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/groups._id.dashboard-3eJLOhsz.js
var $$splitNotFoundComponentImporter = () => import("./groups._id.dashboard-BHF5dZNK.mjs");
var $$splitErrorComponentImporter = () => import("./groups._id.dashboard-FI3nXgGE.mjs");
var $$splitComponentImporter = () => import("./groups._id.dashboard-CjgJuGfr.mjs");
var Route = createFileRoute("/_authenticated/groups/$id/dashboard")({
	head: () => ({ meta: [{ title: "Dashboard do Grupo — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };
