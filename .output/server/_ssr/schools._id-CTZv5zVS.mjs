import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/schools._id-CTZv5zVS.js
var $$splitNotFoundComponentImporter = () => import("./schools._id-CGvpox8A.mjs");
var $$splitErrorComponentImporter = () => import("./schools._id-BRn1e1C0.mjs");
var $$splitComponentImporter = () => import("./schools._id-DEFWJScX.mjs");
var Route = createFileRoute("/_authenticated/schools/$id")({
	head: () => ({ meta: [{ title: "Dashboard da Escola — ProMetric" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };
