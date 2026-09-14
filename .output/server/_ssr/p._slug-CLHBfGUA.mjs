import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Route } from "./p._slug-CgWVaNWn.mjs";
import { t as PortalAluno } from "./portal.aluno._token-C4U38pEu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._slug-CLHBfGUA.js
var import_jsx_runtime = require_jsx_runtime();
function PortalSlugRoute() {
	const { slug } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalAluno, { lookupKey: slug });
}
//#endregion
export { PortalSlugRoute as component };
