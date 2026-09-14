import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-DYw29LwH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-auth-CwvrlDNK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useAuth() {
	const [state, setState] = (0, import_react.useState)({
		session: null,
		user: null,
		loading: true
	});
	(0, import_react.useEffect)(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
			setState({
				session,
				user: session?.user ?? null,
				loading: false
			});
		});
		supabase.auth.getSession().then(({ data }) => {
			setState({
				session: data.session,
				user: data.session?.user ?? null,
				loading: false
			});
		});
		return () => sub.subscription.unsubscribe();
	}, []);
	return state;
}
//#endregion
export { useAuth as t };
