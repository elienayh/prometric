//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-7c4jr3Qg.js
var manifest = {
	"23dc3893d484c180749a99cdc01d063fc9e0badfeef063164d66b6e23ead3307": {
		functionName: "importStudents_createServerFn_handler",
		importer: () => import("./_ssr/students-import.functions-C67aAsB9.mjs")
	},
	"45a68347b1966b9632093fee6cc58a5222ce18870212bdeffd7fea35139ed06e": {
		functionName: "deleteTenantAiCredential_createServerFn_handler",
		importer: () => import("./_ssr/tenant-ai.functions-1I_IFxB8.mjs")
	},
	"7efb8b38bb24d75d7b4d5ff23cc6866822dd376589a7c5a0d560968d5e45bda9": {
		functionName: "issueSheetTokens_createServerFn_handler",
		importer: () => import("./_ssr/sheet.functions-DN0Dv-Gb.mjs")
	},
	"98b53d8be3413f2d94862ceef79532dbb094c189f799ab1200e4d24fabdaa39b": {
		functionName: "getTenantAiConfig_createServerFn_handler",
		importer: () => import("./_ssr/tenant-ai.functions-1I_IFxB8.mjs")
	},
	"aaf53dd3114d355800179ed77b4e41552a506ec2eba41394b7f417b2e9b39195": {
		functionName: "ocrSheetImage_createServerFn_handler",
		importer: () => import("./_ssr/ocr-sheet.functions-C5qFaDmg.mjs")
	},
	"ab9ec8f8669caeed4094314d4cc7bfdba8f861bee25f77a24dc2442632ee7375": {
		functionName: "testTenantAiCredential_createServerFn_handler",
		importer: () => import("./_ssr/tenant-ai.functions-1I_IFxB8.mjs")
	},
	"b4282c780f58a50d3891ee42d34e0df33731eed352a703b1d9f4574d9cd61d70": {
		functionName: "saveTenantAiCredential_createServerFn_handler",
		importer: () => import("./_ssr/tenant-ai.functions-1I_IFxB8.mjs")
	},
	"c6337408bf63234de14ec66bd18b954055367b20153a1222bc755a49b42cc811": {
		functionName: "generatePortalReport_createServerFn_handler",
		importer: () => import("./_ssr/portal-ai-report.functions-D81yA_03.mjs")
	},
	"e7994dafb508e73edf489fca048a2eac0fb340fee4a6332ec1e5fe4131960bca": {
		functionName: "resolveSheetToken_createServerFn_handler",
		importer: () => import("./_ssr/resolve-token.functions-DwoXAyKi.mjs")
	},
	"fa62531b566d3095b56ec514c128f5ee9540f1d16500db1ac84e47386936457c": {
		functionName: "generateDiagnosis_createServerFn_handler",
		importer: () => import("./_ssr/ai-diagnosis.functions-BRqXrs3s.mjs")
	},
	"fdf65247fe2f9f9745b3b496219d517e34af9a3a471f8e87bfb2a840b10904e6": {
		functionName: "generateStudentReport_createServerFn_handler",
		importer: () => import("./_ssr/ai-student-report.functions-DZpzJQR5.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
