import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quick-eval-BdsB-NOe.js
var $$splitComponentImporter = () => import("./quick-eval-BLCGY-qC.mjs");
var Route = createFileRoute("/_authenticated/quick-eval")({
	head: () => ({ meta: [{ title: "Modo Quadra — ProMetric" }] }),
	validateSearch: (s) => ({
		school: typeof s.school === "string" ? s.school : void 0,
		class: typeof s.class === "string" ? s.class : void 0,
		group: typeof s.group === "string" ? s.group : void 0,
		student: typeof s.student === "string" ? s.student : void 0,
		evaluation: typeof s.evaluation === "string" ? s.evaluation : void 0
	}),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
