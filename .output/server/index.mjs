globalThis.__nitro_main__ = import.meta.url;
import { a as FastResponse, n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/BarChart-CiJvqbJv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"159-qF09rlZ0cPW3iuRwIdHPi8X0AHE\"",
		"mtime": "2026-09-14T18:13:20.650Z",
		"size": 345,
		"path": "../public/assets/BarChart-CiJvqbJv.js"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"bf-PtvQdeJbunxSj9dBy9kjTAyG2PE\"",
		"mtime": "2026-09-14T18:13:24.966Z",
		"size": 191,
		"path": "../public/robots.txt"
	},
	"/assets/Combination-Ba4d1Hc8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6336-gB+bA2GbFgRjZgLUGKFvLN82Y4g\"",
		"mtime": "2026-09-14T18:13:20.650Z",
		"size": 25398,
		"path": "../public/assets/Combination-Ba4d1Hc8.js"
	},
	"/assets/PieChart-DLHTe88R.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2d85-ljgpS+TqLGCLdIpcRCjSsDJskKo\"",
		"mtime": "2026-09-14T18:13:20.650Z",
		"size": 11653,
		"path": "../public/assets/PieChart-DLHTe88R.js"
	},
	"/assets/accept-admin._token-vki6Li6W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c33-k5RtqtdVBg3BlLlN/rjhw80B77E\"",
		"mtime": "2026-09-14T18:13:20.650Z",
		"size": 3123,
		"path": "../public/assets/accept-admin._token-vki6Li6W.js"
	},
	"/assets/admin-BOPEG4ax.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b77-KatuFspU5Sjq0EsD0POFktotgb8\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 7031,
		"path": "../public/assets/admin-BOPEG4ax.js"
	},
	"/assets/admin-dashboard-CaHXgsMi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11af-Xwtb6EkPwc/S2mfnz/7TUrd53aA\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 4527,
		"path": "../public/assets/admin-dashboard-CaHXgsMi.js"
	},
	"/assets/admin.administrators-BhnSpLHT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18ce-Z00DcUu5qLY6wW4xqfMIhg/vuec\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 6350,
		"path": "../public/assets/admin.administrators-BhnSpLHT.js"
	},
	"/assets/admin.clients-DwnoGW8s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8e-Zv93e9k9gAp0ByiKGjfezIGVB1s\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 142,
		"path": "../public/assets/admin.clients-DwnoGW8s.js"
	},
	"/assets/action-bar-BMtrAavk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"60c2-oW9F3Fen5SgI0ClcyK2WbyxfoFg\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 24770,
		"path": "../public/assets/action-bar-BMtrAavk.js"
	},
	"/assets/admin.clients._id-BRX4gIhN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"66b3-s2pzjqqkGGRoTGuODLfjZHioesw\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 26291,
		"path": "../public/assets/admin.clients._id-BRX4gIhN.js"
	},
	"/assets/admin.clients.index-CoHncAuk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2aaf-qxuWbpcBOJQgUzlCLXVOe/syuzw\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 10927,
		"path": "../public/assets/admin.clients.index-CoHncAuk.js"
	},
	"/assets/admin.dashboard-BRsPcNfa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"51-L/x+4u14QM730TV8XQxPYYFBwos\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 81,
		"path": "../public/assets/admin.dashboard-BRsPcNfa.js"
	},
	"/assets/admin.demo-BRV5EAfy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b49-48O4Q+WWO7Zq9TGGxPojPqcJljs\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 6985,
		"path": "../public/assets/admin.demo-BRV5EAfy.js"
	},
	"/assets/admin.financial-CiO4jwFf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1fbd-hQB1T0TA9baAT8Aq2wF2qVkm47M\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 8125,
		"path": "../public/assets/admin.financial-CiO4jwFf.js"
	},
	"/assets/admin.logs-C9Mfpqel.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"108c-OVucDG0WX8AJeNrHynqpHFwFLMk\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 4236,
		"path": "../public/assets/admin.logs-C9Mfpqel.js"
	},
	"/assets/admin.monitoring-svs_bgyy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1041-GOanAhBacsaqFX/eeVpIje8j51c\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 4161,
		"path": "../public/assets/admin.monitoring-svs_bgyy.js"
	},
	"/assets/admin.support-ZlcpEnIv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"165f-qHVvU2Q7x1gGL2ZEl/E5RJ6Kyf0\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 5727,
		"path": "../public/assets/admin.support-ZlcpEnIv.js"
	},
	"/assets/ai-student-report.functions-CEmGXujF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-yIjWmOiDqG2M8jMtM6vKSvk6aak\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 254,
		"path": "../public/assets/ai-student-report.functions-CEmGXujF.js"
	},
	"/assets/alert-dialog-D2c_3hZu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"eab-9ZizMcIoSa3Z953gGXWKE6wRcfc\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 3755,
		"path": "../public/assets/alert-dialog-D2c_3hZu.js"
	},
	"/assets/arrow-right-on9kyBdQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5-oNMo5dPfttnqgUFjc51ZWwHQpe4\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 165,
		"path": "../public/assets/arrow-right-on9kyBdQ.js"
	},
	"/assets/auth-beDc7sfT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"27a7-Ig8qMt9UJk8W3hK58tStM3lVU50\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 10151,
		"path": "../public/assets/auth-beDc7sfT.js"
	},
	"/assets/auth-middleware-BYS1FMyo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4e-b/FCgh8N9YSWhTI3SO06lkaa7OE\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 78,
		"path": "../public/assets/auth-middleware-BYS1FMyo.js"
	},
	"/assets/auth.index-DJ7LAi8J.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26-SoFMfAHVJ5oqB5t+mpFRoQvFIoc\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 38,
		"path": "../public/assets/auth.index-DJ7LAi8J.js"
	},
	"/assets/auth.register-DPuDaNv2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-fZ7w1LHFtv26cAu0jUaD5bG84qk\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 162,
		"path": "../public/assets/auth.register-DPuDaNv2.js"
	},
	"/assets/badge-BHju8C6P.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"363-stvgfj5Fh8pHu85pyGqi/bfeE7I\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 867,
		"path": "../public/assets/badge-BHju8C6P.js"
	},
	"/assets/blog-DwnoGW8s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8e-Zv93e9k9gAp0ByiKGjfezIGVB1s\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 142,
		"path": "../public/assets/blog-DwnoGW8s.js"
	},
	"/assets/blog._slug-BsCzJ73W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"196-9nJBjfISs1G27+xHoBlAuxatlTU\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 406,
		"path": "../public/assets/blog._slug-BsCzJ73W.js"
	},
	"/assets/blog._slug-C54tZQxx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e5-z2RzXZJ1IMJFmwovZqES1RIO7xI\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 997,
		"path": "../public/assets/blog._slug-C54tZQxx.js"
	},
	"/assets/blog.index-BYQAUah2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ac2-H7gQL7+EpxbahxY+d2E7jxuJPtU\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 2754,
		"path": "../public/assets/blog.index-BYQAUah2.js"
	},
	"/assets/book-open-DpjOdJDb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"117-vUx57BwVheHAEpEphaa8E41Z4lM\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 279,
		"path": "../public/assets/book-open-DpjOdJDb.js"
	},
	"/assets/brain-CZwzSSo2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"241-wOK3GU62cQdHdJRpkVEMCFM/FOo\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 577,
		"path": "../public/assets/brain-CZwzSSo2.js"
	},
	"/assets/branding-form-CUltDdu0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"186c-lgULnfkFYlDjIRx+T+lKvirYCU4\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 6252,
		"path": "../public/assets/branding-form-CUltDdu0.js"
	},
	"/assets/breadcrumbs-IDBk7CCV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4bb-ov181bzbdRgZ36rIDJf9fYei9x0\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 1211,
		"path": "../public/assets/breadcrumbs-IDBk7CCV.js"
	},
	"/assets/browser-DLm-k4lz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5ba7-Wididm7ShP6kkNp200LxIHe/A88\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 23463,
		"path": "../public/assets/browser-DLm-k4lz.js"
	},
	"/assets/building-2-BLEx5j9w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"17f-6vA/8rW3YTZQn89HZg5a30E/uQI\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 383,
		"path": "../public/assets/building-2-BLEx5j9w.js"
	},
	"/assets/button-BcYpLub3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1058-eYTpfOLvu7aymmWXcvXoGAZvVx8\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 4184,
		"path": "../public/assets/button-BcYpLub3.js"
	},
	"/assets/card-eTKnWtR-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"444-63dO+MMa4qVXXfxMom3tGWhO+co\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 1092,
		"path": "../public/assets/card-eTKnWtR-.js"
	},
	"/assets/chart-column-B2tcHYR9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fb-/4ycpc7aIisy3QzDkxUWuUzxz9g\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 251,
		"path": "../public/assets/chart-column-B2tcHYR9.js"
	},
	"/assets/chart-line-BmIJzWop.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b8-UetRMIcTDItzW4fDf1weXSPEJKE\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 184,
		"path": "../public/assets/chart-line-BmIJzWop.js"
	},
	"/assets/check-J0JYeK11.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7c-zWmWiQ2rQhj6jtQctalBd5kEHnw\"",
		"mtime": "2026-09-14T18:13:20.651Z",
		"size": 124,
		"path": "../public/assets/check-J0JYeK11.js"
	},
	"/assets/chevron-down-dhK5hhN1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"80-CbIVgfR4aCPzKXk8a7CMyZlr7Qs\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 128,
		"path": "../public/assets/chevron-down-dhK5hhN1.js"
	},
	"/assets/chevron-right-Chfw7wLC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"82-aC7jkOs7g4RNawmR0fb/Ndqsko0\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 130,
		"path": "../public/assets/chevron-right-Chfw7wLC.js"
	},
	"/assets/chunk-CMxvf4Kt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c0-lcOPfX/I0l0z6yFy8sw9sPLlYVY\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 1216,
		"path": "../public/assets/chunk-CMxvf4Kt.js"
	},
	"/assets/circle-check-5KdcDrqZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b2-6dCvy9rG3zA9+M1zpdVYKJsSbI8\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 178,
		"path": "../public/assets/circle-check-5KdcDrqZ.js"
	},
	"/assets/classes-DwnoGW8s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8e-Zv93e9k9gAp0ByiKGjfezIGVB1s\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 142,
		"path": "../public/assets/classes-DwnoGW8s.js"
	},
	"/assets/classes._id-Cuey6cz0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b2-NOICXONhgGWKhe/LhxvPScRUab8\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 178,
		"path": "../public/assets/classes._id-Cuey6cz0.js"
	},
	"/assets/classes._id-DUuLohLe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-h/tdsoRMt4oxWSiwf3f2FKrXQhg\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 170,
		"path": "../public/assets/classes._id-DUuLohLe.js"
	},
	"/assets/classes._id-DwnoGW8s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8e-Zv93e9k9gAp0ByiKGjfezIGVB1s\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 142,
		"path": "../public/assets/classes._id-DwnoGW8s.js"
	},
	"/assets/classes._id.dashboard-Cuey6cz0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b2-NOICXONhgGWKhe/LhxvPScRUab8\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 178,
		"path": "../public/assets/classes._id.dashboard-Cuey6cz0.js"
	},
	"/assets/classes._id.dashboard-DUuLohLe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-h/tdsoRMt4oxWSiwf3f2FKrXQhg\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 170,
		"path": "../public/assets/classes._id.dashboard-DUuLohLe.js"
	},
	"/assets/classes._id.dashboard-DYmDAlMh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2261-ZmX/Wdisn1+IH45IpmJxpVIULDM\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 8801,
		"path": "../public/assets/classes._id.dashboard-DYmDAlMh.js"
	},
	"/assets/classes._id.index-BpqSR0T1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fee-xOOzk/BCH8AotH8zmc0L2KzVLSc\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 4078,
		"path": "../public/assets/classes._id.index-BpqSR0T1.js"
	},
	"/assets/classes.index-DKK-IEVx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2936-VbRMXqz+E++WfGxkuZYSnwzF2vs\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 10550,
		"path": "../public/assets/classes.index-DKK-IEVx.js"
	},
	"/assets/client-Dl8OmtcL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"31c72-XFQYpkcE/06YWGDmns1LMtb1cq4\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 203890,
		"path": "../public/assets/client-Dl8OmtcL.js"
	},
	"/assets/clipboard-list-Bwzt2dkf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19b-hAZCBDFntzhhoAUvFbBr9xZzrCk\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 411,
		"path": "../public/assets/clipboard-list-Bwzt2dkf.js"
	},
	"/assets/createLucideIcon-BQMbUa7z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c1-MyxpEcev0pYvhnnpPGwytQ0D+Pw\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 1217,
		"path": "../public/assets/createLucideIcon-BQMbUa7z.js"
	},
	"/assets/dashboard-C7iSU2bf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ae7-q2oV6Nk+PoY776kqr89XkywoRUM\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 10983,
		"path": "../public/assets/dashboard-C7iSU2bf.js"
	},
	"/assets/dist-BCVGCG0E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"293-0yPfhSRNleVSwssxjyA+lfAk7ko\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 659,
		"path": "../public/assets/dist-BCVGCG0E.js"
	},
	"/assets/dollar-sign-Dg1yaEzs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"db-PqJOVvctE38JF1zF2WnYl8rmr8M\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 219,
		"path": "../public/assets/dollar-sign-Dg1yaEzs.js"
	},
	"/assets/dumbbell-CXlo3aSG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"230-q/I6lqv+G1ll5j3raD5V/PHFbSA\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 560,
		"path": "../public/assets/dumbbell-CXlo3aSG.js"
	},
	"/assets/evaluations-DwnoGW8s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8e-Zv93e9k9gAp0ByiKGjfezIGVB1s\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 142,
		"path": "../public/assets/evaluations-DwnoGW8s.js"
	},
	"/assets/evaluations.index-DhWFx2_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"481c-QldlRzXmyHY1TGTwTfDevEY2LXk\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 18460,
		"path": "../public/assets/evaluations.index-DhWFx2_E.js"
	},
	"/assets/executive-R0K9r3j4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2945-BLDpCcvmQVs+xIfVpWLChooDKQQ\"",
		"mtime": "2026-09-14T18:13:20.653Z",
		"size": 10565,
		"path": "../public/assets/executive-R0K9r3j4.js"
	},
	"/assets/external-link-Dnaq-XXE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fb-8VdU65SlI9ZzT7Q9boRjHihs03g\"",
		"mtime": "2026-09-14T18:13:20.653Z",
		"size": 251,
		"path": "../public/assets/external-link-Dnaq-XXE.js"
	},
	"/assets/eye-CPY991wX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"100-No3ZkbZjcj+XNOeooL9ZNcmg/2o\"",
		"mtime": "2026-09-14T18:13:20.653Z",
		"size": 256,
		"path": "../public/assets/eye-CPY991wX.js"
	},
	"/assets/file-spreadsheet-DgX7BldI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ac-l1u7SPy0W4Oufti69lIKDmQhbTI\"",
		"mtime": "2026-09-14T18:13:20.653Z",
		"size": 428,
		"path": "../public/assets/file-spreadsheet-DgX7BldI.js"
	},
	"/assets/file-text-Dne2ZLFA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"181-Hlt+XBKpX4rGipuKxrnzpaxQaRI\"",
		"mtime": "2026-09-14T18:13:20.653Z",
		"size": 385,
		"path": "../public/assets/file-text-Dne2ZLFA.js"
	},
	"/assets/flask-conical-15CbzJji.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12e-gy6Z6V41E8NyDkVsTXY1Mjqgtb8\"",
		"mtime": "2026-09-14T18:13:20.653Z",
		"size": 302,
		"path": "../public/assets/flask-conical-15CbzJji.js"
	},
	"/assets/generateCategoricalChart-CbAT4LVE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"550ea-el9t3DIU9KL83izvo/rqp4dZF/U\"",
		"mtime": "2026-09-14T18:13:20.653Z",
		"size": 348394,
		"path": "../public/assets/generateCategoricalChart-CbAT4LVE.js"
	},
	"/assets/graduation-cap-DuBNRW8G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14c-2oGWqzOdmHvUoY1RU46M6e3hanM\"",
		"mtime": "2026-09-14T18:13:20.653Z",
		"size": 332,
		"path": "../public/assets/graduation-cap-DuBNRW8G.js"
	},
	"/assets/groups-DwnoGW8s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8e-Zv93e9k9gAp0ByiKGjfezIGVB1s\"",
		"mtime": "2026-09-14T18:13:20.653Z",
		"size": 142,
		"path": "../public/assets/groups-DwnoGW8s.js"
	},
	"/assets/groups._id-BYnUP11Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-STyRMLUwyMNw0CDTQYBfpOXUKYg\"",
		"mtime": "2026-09-14T18:13:20.653Z",
		"size": 170,
		"path": "../public/assets/groups._id-BYnUP11Q.js"
	},
	"/assets/groups._id-Cuey6cz0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b2-NOICXONhgGWKhe/LhxvPScRUab8\"",
		"mtime": "2026-09-14T18:13:20.653Z",
		"size": 178,
		"path": "../public/assets/groups._id-Cuey6cz0.js"
	},
	"/assets/evaluations.import-BAeGXXzt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9db73-OhjZecsiDXq7UqutfM+YrlTrc7Y\"",
		"mtime": "2026-09-14T18:13:20.652Z",
		"size": 646003,
		"path": "../public/assets/evaluations.import-BAeGXXzt.js"
	},
	"/assets/groups._id-DwnoGW8s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8e-Zv93e9k9gAp0ByiKGjfezIGVB1s\"",
		"mtime": "2026-09-14T18:13:20.653Z",
		"size": 142,
		"path": "../public/assets/groups._id-DwnoGW8s.js"
	},
	"/assets/groups._id.dashboard-BYnUP11Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-STyRMLUwyMNw0CDTQYBfpOXUKYg\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 170,
		"path": "../public/assets/groups._id.dashboard-BYnUP11Q.js"
	},
	"/assets/groups._id.dashboard-Cuey6cz0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b2-NOICXONhgGWKhe/LhxvPScRUab8\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 178,
		"path": "../public/assets/groups._id.dashboard-Cuey6cz0.js"
	},
	"/assets/groups._id.dashboard-nY6oQ9Pp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25cd-4geMjPLaqx1CHFBAZLwqfslss0M\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 9677,
		"path": "../public/assets/groups._id.dashboard-nY6oQ9Pp.js"
	},
	"/assets/groups._id.index-CX-qdNBc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2d5d-oLMIVdwFiD7fjBcu14O+npKAuNE\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 11613,
		"path": "../public/assets/groups._id.index-CX-qdNBc.js"
	},
	"/assets/groups.index-DLxk93Rf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13c4-kKZPnwCRng7WmSlDwRTeCs4uLuU\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 5060,
		"path": "../public/assets/groups.index-DLxk93Rf.js"
	},
	"/assets/heart-pulse-DbrJqwZb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14d-Rl3x1mU5k1EX6F1mWa7vWQ0WBjA\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 333,
		"path": "../public/assets/heart-pulse-DbrJqwZb.js"
	},
	"/assets/index.es-Co7SRGvI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24fea-xm+G60ibCWLW0Ta2QjR8yXCmRUM\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 151530,
		"path": "../public/assets/index.es-Co7SRGvI.js"
	},
	"/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2": {
		"type": "font/woff2",
		"etag": "\"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 25960,
		"path": "../public/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2"
	},
	"/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2": {
		"type": "font/woff2",
		"etag": "\"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 18748,
		"path": "../public/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2"
	},
	"/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2": {
		"type": "font/woff2",
		"etag": "\"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 11232,
		"path": "../public/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2"
	},
	"/assets/html2canvas-BdJsst-T.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"30b90-Rama1rn9MM6T+SsT8tGoZ05l6As\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 199568,
		"path": "../public/assets/html2canvas-BdJsst-T.js"
	},
	"/assets/inter-greek-wght-normal-CkhJZR-_.woff2": {
		"type": "font/woff2",
		"etag": "\"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 18996,
		"path": "../public/assets/inter-greek-wght-normal-CkhJZR-_.woff2"
	},
	"/assets/inter-latin-wght-normal-Dx4kXJAl.woff2": {
		"type": "font/woff2",
		"etag": "\"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 48256,
		"path": "../public/assets/inter-latin-wght-normal-Dx4kXJAl.woff2"
	},
	"/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2": {
		"type": "font/woff2",
		"etag": "\"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 85068,
		"path": "../public/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2"
	},
	"/assets/invariant-DEEwAagU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3c-eVh/3DMi1s3cxf4N/OJar+ew1jA\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 60,
		"path": "../public/assets/invariant-DEEwAagU.js"
	},
	"/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2": {
		"type": "font/woff2",
		"etag": "\"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 10252,
		"path": "../public/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2"
	},
	"/assets/invite._token-Dzvtr9MU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f59-HMZTOgWAaXmiKbLs7xfs+XbPMNs\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 3929,
		"path": "../public/assets/invite._token-Dzvtr9MU.js"
	},
	"/assets/jsx-runtime-sLPvdpSW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a8-h3WwaHJA0Y+J2qB+47N37llhMy4\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 424,
		"path": "../public/assets/jsx-runtime-sLPvdpSW.js"
	},
	"/assets/knowledge-CLPRdGPu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32a8-i9FRrqhGWdO7+LcoTvmGa1ooYOo\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 12968,
		"path": "../public/assets/knowledge-CLPRdGPu.js"
	},
	"/assets/link-Cm19_-_O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11a7-n2yV3bNlqXmWUc1GJ46IGz1bItE\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 4519,
		"path": "../public/assets/link-Cm19_-_O.js"
	},
	"/assets/log-in-Be8K3iNp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e7-onND+G6MaAwUqHHIoA27m8LsjSs\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 231,
		"path": "../public/assets/log-in-Be8K3iNp.js"
	},
	"/assets/login-DnOQy9xP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-/k4VHBiPSDc7sysiz0AjMHykTKY\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 162,
		"path": "../public/assets/login-DnOQy9xP.js"
	},
	"/assets/matchContext-_L8FML7Y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b8-n46bIJpG4YmIqqWJCOc0ROkbGoI\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 184,
		"path": "../public/assets/matchContext-_L8FML7Y.js"
	},
	"/assets/index-CjiLIvhc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11e5ed-skj8Pg45C4bXxOlGA+rEbf5bveo\"",
		"mtime": "2026-09-14T18:13:20.650Z",
		"size": 1172973,
		"path": "../public/assets/index-CjiLIvhc.js"
	},
	"/assets/menu-BwQMdoad.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28e-IaMELkqCvuAPSag077TSAFVEot8\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 654,
		"path": "../public/assets/menu-BwQMdoad.js"
	},
	"/assets/no-data-state-DqIMxg1I.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32ed-TuSZmRAkwLTIEmADhB88vqfpaiY\"",
		"mtime": "2026-09-14T18:13:20.654Z",
		"size": 13037,
		"path": "../public/assets/no-data-state-DqIMxg1I.js"
	},
	"/assets/p._slug-DrabuYJt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c7-92FMf7lWdmAC9LbjJjcan9+YvHo\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 199,
		"path": "../public/assets/p._slug-DrabuYJt.js"
	},
	"/assets/page-header-CtZshDr2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"873-+up50adQQzqdYn8q/pv8KU+CECA\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 2163,
		"path": "../public/assets/page-header-CtZshDr2.js"
	},
	"/assets/palette-BwzWz6CP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1fe-p+bgYxKA+y4nC+CDgQCfO+D89Tg\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 510,
		"path": "../public/assets/palette-BwzWz6CP.js"
	},
	"/assets/pdf-evolution-report-paLr8kXk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3f88-HW5GQ37d4Mh3a6WszOAdSUu5tb4\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 16264,
		"path": "../public/assets/pdf-evolution-report-paLr8kXk.js"
	},
	"/assets/pencil-CtaEZv8-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"114-7fVZxMnEN7th91sPp1DpJ05K6PE\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 276,
		"path": "../public/assets/pencil-CtaEZv8-.js"
	},
	"/assets/play-DJF4IAIv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15c-66+9wkZ0hQSI1A4UUQX+8bhxXtM\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 348,
		"path": "../public/assets/play-DJF4IAIv.js"
	},
	"/assets/plus-siIHcig6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"99-eewGZUxtBl3rCBvAA/Zbg+xrqxM\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 153,
		"path": "../public/assets/plus-siIHcig6.js"
	},
	"/assets/portal.aluno._token-z1FWuGKE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5727-cPP8z4CkPE7Ytgg9nYfPgBGfG3Q\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 22311,
		"path": "../public/assets/portal.aluno._token-z1FWuGKE.js"
	},
	"/assets/preload-helper-zJ_50EbN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4a9-jUfFKCyfaRG0LCmrRFreK8BlWnM\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 1193,
		"path": "../public/assets/preload-helper-zJ_50EbN.js"
	},
	"/assets/print-batch-CNCDbxaT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28d-hjRDfvVD1L1zoSGZV6QI/X88IwY\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 653,
		"path": "../public/assets/print-batch-CNCDbxaT.js"
	},
	"/assets/proesp-DuZnYqd0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f0e-hGcrlgwD+asKiilYjjHW0WrPXuE\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 7950,
		"path": "../public/assets/proesp-DuZnYqd0.js"
	},
	"/assets/progress-CbsywWst.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"834-vl4g/V1XgfuCtV6Cavy6+IAo7IU\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 2100,
		"path": "../public/assets/progress-CbsywWst.js"
	},
	"/assets/purify.es-CJ-rlsNn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6929-ergmMos3gXYo74pRomZoTeSqbZ0\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 26921,
		"path": "../public/assets/purify.es-CJ-rlsNn.js"
	},
	"/assets/quick-eval-D2XYU9H4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7ad3-C96UU0grl71V04QXeeIMXX/b1eE\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 31443,
		"path": "../public/assets/quick-eval-D2XYU9H4.js"
	},
	"/assets/react-CiG4YQQ8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d61-qXH+Rui9Ij+JVHm5zumjNQOePr4\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 7521,
		"path": "../public/assets/react-CiG4YQQ8.js"
	},
	"/assets/react-dom-Dr72zIxC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"df0-kNPp6U8pRjvkB1Wn8BvgbcsXrUk\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 3568,
		"path": "../public/assets/react-dom-Dr72zIxC.js"
	},
	"/assets/register-DPuDaNv2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-fZ7w1LHFtv26cAu0jUaD5bG84qk\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 162,
		"path": "../public/assets/register-DPuDaNv2.js"
	},
	"/assets/reports-Bq9YbS_T.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e2f-s5zCIHo7UuNDkC7v3xwknot4eUQ\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 7727,
		"path": "../public/assets/reports-Bq9YbS_T.js"
	},
	"/assets/reset-password-Dv6acPtn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"910-TLhy3qDwGlqWek6e6ku6qv1urt0\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 2320,
		"path": "../public/assets/reset-password-Dv6acPtn.js"
	},
	"/assets/redirect-DCb_aIiF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"271-AJO48VqfkUfrNYq6mvZqsvvYRKY\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 625,
		"path": "../public/assets/redirect-DCb_aIiF.js"
	},
	"/assets/risk-Dssph4k4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2543-c3gDHhyZF0oBVDueg2ARTDtfISM\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 9539,
		"path": "../public/assets/risk-Dssph4k4.js"
	},
	"/assets/route-DxcNkv7r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e5b-6gU9Vy63JUV9PFiEP6HwJ064Bio\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 15963,
		"path": "../public/assets/route-DxcNkv7r.js"
	},
	"/assets/routes-Csk1OkXj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"666d-kM0ipfJyPcx3sUoZJtn//hrHd5k\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 26221,
		"path": "../public/assets/routes-Csk1OkXj.js"
	},
	"/assets/run6min-input-DdebHwSv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8ce-AY+nprg2vQYoOzrq3m5H6bmnNPQ\"",
		"mtime": "2026-09-14T18:13:20.655Z",
		"size": 2254,
		"path": "../public/assets/run6min-input-DdebHwSv.js"
	},
	"/assets/save-B29BboPB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"147-ruJHCEQ5xiOAEgnBt0nYjLSyZBk\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 327,
		"path": "../public/assets/save-B29BboPB.js"
	},
	"/assets/scan-line-Du_4NHC8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14b-ExuGUONHETSNVgMq7D9jBy3JaCw\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 331,
		"path": "../public/assets/scan-line-Du_4NHC8.js"
	},
	"/assets/schools-4fOGTMES.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"211d-vuM2KPvcAodIoPgID7EuUE2fI1c\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 8477,
		"path": "../public/assets/schools-4fOGTMES.js"
	},
	"/assets/schools._id-Cuey6cz0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b2-NOICXONhgGWKhe/LhxvPScRUab8\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 178,
		"path": "../public/assets/schools._id-Cuey6cz0.js"
	},
	"/assets/schools._id-D9E5LNkc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3522-6xDdctiWbGY0WnfJKTaRVfgyRl0\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 13602,
		"path": "../public/assets/schools._id-D9E5LNkc.js"
	},
	"/assets/schools._id-H8KjMPSq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ab-relIc3qStcyflCS6joAdysFGoNQ\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 171,
		"path": "../public/assets/schools._id-H8KjMPSq.js"
	},
	"/assets/search-C1oCOc6R.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ae-UGwqDg7iX+iV6ofQgtJFuOCuWVY\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 174,
		"path": "../public/assets/search-C1oCOc6R.js"
	},
	"/assets/settings-DJyeJpXR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3be3-BrcKmeSah8743Cf0Q2YPioKlFRQ\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 15331,
		"path": "../public/assets/settings-DJyeJpXR.js"
	},
	"/assets/shield-D_hl_Dcr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"110-Yza3O4aT99IDq3NR3HMB1g6UlgM\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 272,
		"path": "../public/assets/shield-D_hl_Dcr.js"
	},
	"/assets/shield-check-DmTxGbNg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"140-jcq0TRbPaXuOEw8vnN20J4f4ebY\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 320,
		"path": "../public/assets/shield-check-DmTxGbNg.js"
	},
	"/assets/space-grotesk-latin-400-normal-BnQMeOim.woff": {
		"type": "font/woff",
		"etag": "\"426c-ghmNOmJRvnMHZL5v05+7tCgOuLs\"",
		"mtime": "2026-09-14T18:13:20.658Z",
		"size": 17004,
		"path": "../public/assets/space-grotesk-latin-400-normal-BnQMeOim.woff"
	},
	"/assets/space-grotesk-latin-400-normal-CJ-V5oYT.woff2": {
		"type": "font/woff2",
		"etag": "\"344c-4RfT7aFk3EnbF6Hh/aQS0Dwt6dI\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 13388,
		"path": "../public/assets/space-grotesk-latin-400-normal-CJ-V5oYT.woff2"
	},
	"/assets/space-grotesk-latin-500-normal-CNSSEhBt.woff": {
		"type": "font/woff",
		"etag": "\"425c-1Gf7i6aAUt1Fd7tGn4+HkNYVOw0\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 16988,
		"path": "../public/assets/space-grotesk-latin-500-normal-CNSSEhBt.woff"
	},
	"/assets/space-grotesk-latin-600-normal-BflQw4A9.woff": {
		"type": "font/woff",
		"etag": "\"41f4-A1LHI2d4uZUcNIX0toiV/mWCn98\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 16884,
		"path": "../public/assets/space-grotesk-latin-600-normal-BflQw4A9.woff"
	},
	"/assets/space-grotesk-latin-500-normal-lFbtlQH6.woff2": {
		"type": "font/woff2",
		"etag": "\"3400-3SdZBxxMFqhCiNds2b7VWFQknAo\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 13312,
		"path": "../public/assets/space-grotesk-latin-500-normal-lFbtlQH6.woff2"
	},
	"/assets/space-grotesk-latin-600-normal-DjKNqYRj.woff2": {
		"type": "font/woff2",
		"etag": "\"33e4-2jIlH+AsPyFgIaKwqDO5WYXfeQY\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 13284,
		"path": "../public/assets/space-grotesk-latin-600-normal-DjKNqYRj.woff2"
	},
	"/assets/space-grotesk-latin-700-normal-CwsQ-cCU.woff": {
		"type": "font/woff",
		"etag": "\"4020-6+Lv6SyfClI9gHZHIfMCmlje8BE\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 16416,
		"path": "../public/assets/space-grotesk-latin-700-normal-CwsQ-cCU.woff"
	},
	"/assets/space-grotesk-latin-700-normal-RjhwGPKo.woff2": {
		"type": "font/woff2",
		"etag": "\"3228-CUaBya012LbSd7QFPXYy34srV9k\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 12840,
		"path": "../public/assets/space-grotesk-latin-700-normal-RjhwGPKo.woff2"
	},
	"/assets/space-grotesk-latin-ext-400-normal-CfP_5XZW.woff2": {
		"type": "font/woff2",
		"etag": "\"2fe0-c3xYOMmU2wqZgHAe410CnfS5OGE\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 12256,
		"path": "../public/assets/space-grotesk-latin-ext-400-normal-CfP_5XZW.woff2"
	},
	"/assets/sheet-pdf-CIxLrPrJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1262-yzf7xphJf5X1RjtlDOzd64E3m5k\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 4706,
		"path": "../public/assets/sheet-pdf-CIxLrPrJ.js"
	},
	"/assets/pdf.worker-DTrjDNvb.mjs": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"248d92-//v+yCgCys1Lz5vkf3Je1rdeB/I\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 2395538,
		"path": "../public/assets/pdf.worker-DTrjDNvb.mjs"
	},
	"/assets/space-grotesk-latin-ext-400-normal-DRPE3kg4.woff": {
		"type": "font/woff",
		"etag": "\"4194-65sd2rUQ1RXSRzlf/UdsfnxLy8Q\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 16788,
		"path": "../public/assets/space-grotesk-latin-ext-400-normal-DRPE3kg4.woff"
	},
	"/assets/space-grotesk-latin-ext-500-normal-3dgZTiw9.woff": {
		"type": "font/woff",
		"etag": "\"4194-lEc2+CK+OmFY8daY+Wm75LFagxg\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 16788,
		"path": "../public/assets/space-grotesk-latin-ext-500-normal-3dgZTiw9.woff"
	},
	"/assets/space-grotesk-latin-ext-500-normal-DUe3BAxM.woff2": {
		"type": "font/woff2",
		"etag": "\"2ff0-mtGWYEDYMf3fdjHjQ1RuTjmuuKI\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 12272,
		"path": "../public/assets/space-grotesk-latin-ext-500-normal-DUe3BAxM.woff2"
	},
	"/assets/space-grotesk-latin-ext-600-normal-DxxdqCpr.woff2": {
		"type": "font/woff2",
		"etag": "\"3000-6K2CsKJNrxHeh6w0a0WeKzYg/RY\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 12288,
		"path": "../public/assets/space-grotesk-latin-ext-600-normal-DxxdqCpr.woff2"
	},
	"/assets/space-grotesk-latin-ext-600-normal-VcznFIpX.woff": {
		"type": "font/woff",
		"etag": "\"4158-hXJ05iafhGTLOF1Sjuwds70aYJk\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 16728,
		"path": "../public/assets/space-grotesk-latin-ext-600-normal-VcznFIpX.woff"
	},
	"/assets/space-grotesk-latin-ext-700-normal-BQnZhY3m.woff2": {
		"type": "font/woff2",
		"etag": "\"2ed8-TBMRoktioCogW6/NM520zKySXcU\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 11992,
		"path": "../public/assets/space-grotesk-latin-ext-700-normal-BQnZhY3m.woff2"
	},
	"/assets/space-grotesk-latin-ext-700-normal-HVCqSBdx.woff": {
		"type": "font/woff",
		"etag": "\"404c-FfjgS7J3XUuOSTAwuPCMJSSAvt0\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 16460,
		"path": "../public/assets/space-grotesk-latin-ext-700-normal-HVCqSBdx.woff"
	},
	"/assets/space-grotesk-vietnamese-400-normal-B7xT_GF5.woff2": {
		"type": "font/woff2",
		"etag": "\"10c8-1JGRw5hFjWC+pPUJ6csycnKgHxA\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 4296,
		"path": "../public/assets/space-grotesk-vietnamese-400-normal-B7xT_GF5.woff2"
	},
	"/assets/space-grotesk-vietnamese-400-normal-BIWiOVfw.woff": {
		"type": "font/woff",
		"etag": "\"1660-Gmat2y5b870gScU9KClIjJn3GqI\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 5728,
		"path": "../public/assets/space-grotesk-vietnamese-400-normal-BIWiOVfw.woff"
	},
	"/assets/space-grotesk-vietnamese-500-normal-BTqKIpxg.woff": {
		"type": "font/woff",
		"etag": "\"1654-JlaMSeciVxCokGS+Dt+IN52KVoc\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 5716,
		"path": "../public/assets/space-grotesk-vietnamese-500-normal-BTqKIpxg.woff"
	},
	"/assets/space-grotesk-vietnamese-500-normal-BmEvtly_.woff2": {
		"type": "font/woff2",
		"etag": "\"10e4-UNTFOrnCmfOI7UspLiuWXm466zw\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 4324,
		"path": "../public/assets/space-grotesk-vietnamese-500-normal-BmEvtly_.woff2"
	},
	"/assets/space-grotesk-vietnamese-600-normal-D6zpsUhD.woff": {
		"type": "font/woff",
		"etag": "\"1648-U831D1UvvnP2XK3oeBMahBZ6uAA\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 5704,
		"path": "../public/assets/space-grotesk-vietnamese-600-normal-D6zpsUhD.woff"
	},
	"/assets/space-grotesk-vietnamese-600-normal-DUi7WF5p.woff2": {
		"type": "font/woff2",
		"etag": "\"10d8-zLY8xT+eAaR0b+FEszj/7T+CXbA\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 4312,
		"path": "../public/assets/space-grotesk-vietnamese-600-normal-DUi7WF5p.woff2"
	},
	"/assets/space-grotesk-vietnamese-700-normal-DMty7AZE.woff2": {
		"type": "font/woff2",
		"etag": "\"106c-OvrbrxRBqhaoWMfcV7ZXQfDd/bQ\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 4204,
		"path": "../public/assets/space-grotesk-vietnamese-700-normal-DMty7AZE.woff2"
	},
	"/assets/space-grotesk-vietnamese-700-normal-Duxec5Rn.woff": {
		"type": "font/woff",
		"etag": "\"15d4-G/yewNcLknFzx6or6nPJYti8zRg\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 5588,
		"path": "../public/assets/space-grotesk-vietnamese-700-normal-Duxec5Rn.woff"
	},
	"/assets/students-DwnoGW8s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8e-Zv93e9k9gAp0ByiKGjfezIGVB1s\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 142,
		"path": "../public/assets/students-DwnoGW8s.js"
	},
	"/assets/src-Qm_Y4mi8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4355-HUvB/okog6mc2Wq3RYdYz7X94G4\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 17237,
		"path": "../public/assets/src-Qm_Y4mi8.js"
	},
	"/assets/students.import-Dhmt4DU_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2caa-HRBExnxbvINJ0piuGVHwdrfn2Fk\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 11434,
		"path": "../public/assets/students.import-Dhmt4DU_.js"
	},
	"/assets/students.index-dhBH9MnV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"27d5-fLEo3vDHQbU23ur2wemEzk7KTVc\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 10197,
		"path": "../public/assets/students.index-dhBH9MnV.js"
	},
	"/assets/styles-edjHGgSo.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1d830-dW5DFL+W3x+8yLjUxKOT/QwHMz0\"",
		"mtime": "2026-09-14T18:13:20.659Z",
		"size": 120880,
		"path": "../public/assets/styles-edjHGgSo.css"
	},
	"/assets/tabs-CipXt8LK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aa6-orPBa6Lxk3FBGlSayWGhenlfk+8\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 6822,
		"path": "../public/assets/tabs-CipXt8LK.js"
	},
	"/assets/team-CQ8LMqK4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c7d-eCvPWYndiC5gczYOU5oZHKJlwR4\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 7293,
		"path": "../public/assets/team-CQ8LMqK4.js"
	},
	"/assets/textarea-LLMqWdRb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"244-KgkKbXU3dwdkvLwjoh87vwT9hPo\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 580,
		"path": "../public/assets/textarea-LLMqWdRb.js"
	},
	"/assets/theme-toggle-CYT9B5j0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1520-Te83Q1sIlJkSA5tJ6+nYZWz4IYI\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 5408,
		"path": "../public/assets/theme-toggle-CYT9B5j0.js"
	},
	"/assets/trash-2-CUBZivTZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-7dcjFB2EJAl+U6nkgds9GxUYC9A\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 328,
		"path": "../public/assets/trash-2-CUBZivTZ.js"
	},
	"/assets/students._id-DRhL2d_M.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ed1b-7QVssfjZlZ52ab/jtFgFOs49Z94\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 60699,
		"path": "../public/assets/students._id-DRhL2d_M.js"
	},
	"/assets/triangle-alert-C3Tp7QjM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"109-COp9rloMrpvp3xa9uoVdLbYZRCw\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 265,
		"path": "../public/assets/triangle-alert-C3Tp7QjM.js"
	},
	"/assets/upload-D0YXsNoI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e6-m+poru6ceEiIN8xvc5IKqlyF2oo\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 230,
		"path": "../public/assets/upload-D0YXsNoI.js"
	},
	"/assets/typeof-B5XbjTb1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f-yPXEOGyFHb1Ws7OoWyWNEEBz4mQ\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 271,
		"path": "../public/assets/typeof-B5XbjTb1.js"
	},
	"/assets/use-admin-DmhavAuE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3f4-5YEyEBu+yytTmArbWbMLvxWP4No\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 1012,
		"path": "../public/assets/use-admin-DmhavAuE.js"
	},
	"/assets/use-auth-DhHrbeCl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e7-OxvADAKbUJSwNeJ7lv37fQqSwF4\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 487,
		"path": "../public/assets/use-auth-DhHrbeCl.js"
	},
	"/assets/use-tenant-yqNFsYq5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5e9-7UOkbE9Cs2hQ5Ya7An0+QKFgbsM\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 1513,
		"path": "../public/assets/use-tenant-yqNFsYq5.js"
	},
	"/assets/useQuery-Dg545w6d.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5c9b-lLyXVrDqEPAx3ioIwkxxYRUdlYE\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 23707,
		"path": "../public/assets/useQuery-Dg545w6d.js"
	},
	"/assets/useRouter-8ZwSFeh-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ad-ZNl05nH96hyeaCJVWwV/CHF3wu0\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 173,
		"path": "../public/assets/useRouter-8ZwSFeh-.js"
	},
	"/assets/useRouterState-DWSbSqIa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ec-YuVElBP67DtotlobaxkiKkIzxX4\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 236,
		"path": "../public/assets/useRouterState-DWSbSqIa.js"
	},
	"/assets/user-plus-DurAmbJH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"136-TpQbNuqa8Fdp/7A+YL7HJJ5aWGk\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 310,
		"path": "../public/assets/user-plus-DurAmbJH.js"
	},
	"/assets/useStore-CF2o4AL-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"485b-i6dx8vPTyk7AvCZCUtiwR9vVOlg\"",
		"mtime": "2026-09-14T18:13:20.656Z",
		"size": 18523,
		"path": "../public/assets/useStore-CF2o4AL-.js"
	},
	"/assets/users-ByGqvcfy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"132-GXaw5JMITrL5D6OB3tMY0nWpO8Y\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 306,
		"path": "../public/assets/users-ByGqvcfy.js"
	},
	"/assets/users-round-CFF31Nbh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd-IpfIdOboGiahmgpCP2hVjzigtgI\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 253,
		"path": "../public/assets/users-round-CFF31Nbh.js"
	},
	"/assets/utils-DpFLmdQ4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"274-Vo90l0OTE14VIJiLsBfcHGB5LN4\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 628,
		"path": "../public/assets/utils-DpFLmdQ4.js"
	},
	"/assets/utils-B6KiDbIe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6a7d-iNkBSvaSyIjvZOzWoTvEa49qwcI\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 27261,
		"path": "../public/assets/utils-B6KiDbIe.js"
	},
	"/assets/xlsx-Ba7xMI6d.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"66ef8-Et8YcvjZJbZJRj97PJpH2lX1Brs\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 421624,
		"path": "../public/assets/xlsx-Ba7xMI6d.js"
	},
	"/assets/zap-BnKGXMQy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"106-eO/bev1rM7sMXudJp4OuSL8Ixmo\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 262,
		"path": "../public/assets/zap-BnKGXMQy.js"
	},
	"/assets/x-ChPs8bUl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-v8BDDuJcikh9cBCUf5wobpF0QO8\"",
		"mtime": "2026-09-14T18:13:20.657Z",
		"size": 154,
		"path": "../public/assets/x-ChPs8bUl.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_FykAQf = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_FykAQf
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
