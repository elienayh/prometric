import { l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-QP6BYy5L.mjs";
import { t as createSsrRpc } from "./createSsrRpc-p5Uzme7Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-student-report.functions-DzwmKvJP.js
var generateStudentReport = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => {
	if (!data?.studentId) throw new Error("studentId obrigatório");
	return data;
}).handler(createSsrRpc("fdf65247fe2f9f9745b3b496219d517e34af9a3a471f8e87bfb2a840b10904e6"));
//#endregion
export { generateStudentReport };
