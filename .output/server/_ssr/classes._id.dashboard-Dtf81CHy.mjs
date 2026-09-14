import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/classes._id.dashboard-Dtf81CHy.js
var $$splitNotFoundComponentImporter = () => import("./classes._id.dashboard-CzyKn5VC.mjs");
var $$splitErrorComponentImporter = () => import("./classes._id.dashboard-DqQ6uNKT.mjs");
var $$splitComponentImporter = () => import("./classes._id.dashboard-DrPUh3xr.mjs");
var Route = createFileRoute("/_authenticated/classes/$id/dashboard")({
	head: () => ({ meta: [{ title: "Dashboard da Turma — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };
