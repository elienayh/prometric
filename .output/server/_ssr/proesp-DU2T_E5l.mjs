//#region node_modules/.nitro/vite/services/ssr/assets/proesp-DU2T_E5l.js
var ZONES = [
	"Muito Fraco",
	"Fraco",
	"Razoável",
	"Bom",
	"Muito Bom",
	"Excelente"
];
function zoneColor(z) {
	switch (z) {
		case "Excelente": return "bg-success/20 text-success border-success/30";
		case "Muito Bom": return "bg-success/15 text-success border-success/20";
		case "Bom": return "bg-primary/15 text-primary border-primary/30";
		case "Razoável": return "bg-accent/20 text-accent-foreground border-accent/30";
		case "Fraco": return "bg-warning/20 text-warning border-warning/30";
		case "Muito Fraco": return "bg-destructive/15 text-destructive border-destructive/30";
		default: return "bg-muted text-muted-foreground border-border";
	}
}
function ageFromBirth(birth, ref = /* @__PURE__ */ new Date()) {
	const b = new Date(birth);
	const d = ref.getTime() - b.getTime();
	return Math.max(0, Math.floor(d / (365.25 * 24 * 3600 * 1e3)));
}
function calcImc(weightKg, heightCm) {
	if (!weightKg || !heightCm) return null;
	const h = heightCm / 100;
	return +(weightKg / (h * h)).toFixed(2);
}
function calcRce(waistCm, heightCm) {
	if (!waistCm || !heightCm) return null;
	return +(waistCm / heightCm).toFixed(3);
}
function imcZone(imc, age, sex) {
	if (imc == null) return null;
	if (age >= 18) {
		if (imc < 16) return "Muito Fraco";
		if (imc < 18.5) return "Fraco";
		if (imc < 25) return "Excelente";
		if (imc < 30) return "Razoável";
		return "Muito Fraco";
	}
	const base = sex === "male" ? [
		14,
		15.5,
		22.5,
		25,
		28
	] : [
		13.5,
		15,
		22.5,
		25.5,
		28.5
	];
	if (imc < base[0]) return "Muito Fraco";
	if (imc < base[1]) return "Fraco";
	if (imc < base[2]) return "Excelente";
	if (imc < base[3]) return "Razoável";
	if (imc < base[4]) return "Fraco";
	return "Muito Fraco";
}
function rceZone(rce) {
	if (rce == null) return null;
	if (rce < .4) return "Razoável";
	if (rce < .5) return "Excelente";
	if (rce < .55) return "Razoável";
	if (rce < .6) return "Fraco";
	return "Muito Fraco";
}
function classifyHigher(val, cuts) {
	if (val <= cuts[0]) return "Muito Fraco";
	if (val <= cuts[1]) return "Fraco";
	if (val <= cuts[2]) return "Razoável";
	if (val <= cuts[3]) return "Bom";
	if (val <= cuts[4]) return "Muito Bom";
	return "Excelente";
}
function classifyLower(val, cuts) {
	if (val >= cuts[0]) return "Muito Fraco";
	if (val >= cuts[1]) return "Fraco";
	if (val >= cuts[2]) return "Razoável";
	if (val >= cuts[3]) return "Bom";
	if (val >= cuts[4]) return "Muito Bom";
	return "Excelente";
}
function pickCut(table, sex, age) {
	const t = table[sex];
	return t[Math.max(6, Math.min(17, age))] ?? t[Math.min(...Object.keys(t).map(Number))] ?? null;
}
var FLEX = {
	male: {
		6: [
			15,
			20,
			24,
			28,
			32
		],
		7: [
			15,
			20,
			24,
			28,
			32
		],
		8: [
			15,
			20,
			24,
			28,
			32
		],
		9: [
			14,
			19,
			23,
			27,
			31
		],
		10: [
			14,
			19,
			23,
			27,
			31
		],
		11: [
			14,
			19,
			23,
			28,
			32
		],
		12: [
			14,
			19,
			23,
			28,
			33
		],
		13: [
			15,
			20,
			24,
			29,
			34
		],
		14: [
			16,
			21,
			25,
			30,
			35
		],
		15: [
			17,
			22,
			27,
			32,
			37
		],
		16: [
			18,
			24,
			29,
			34,
			39
		],
		17: [
			20,
			25,
			30,
			35,
			40
		]
	},
	female: {
		6: [
			18,
			23,
			28,
			32,
			36
		],
		7: [
			18,
			23,
			28,
			32,
			36
		],
		8: [
			18,
			23,
			28,
			32,
			36
		],
		9: [
			18,
			23,
			28,
			33,
			37
		],
		10: [
			19,
			24,
			29,
			34,
			38
		],
		11: [
			20,
			25,
			30,
			35,
			39
		],
		12: [
			21,
			26,
			31,
			36,
			40
		],
		13: [
			22,
			27,
			32,
			37,
			41
		],
		14: [
			23,
			28,
			33,
			38,
			42
		],
		15: [
			24,
			29,
			34,
			39,
			43
		],
		16: [
			25,
			30,
			35,
			40,
			44
		],
		17: [
			26,
			31,
			36,
			41,
			45
		]
	}
};
var ABDO = {
	male: {
		6: [
			8,
			14,
			20,
			26,
			32
		],
		7: [
			10,
			16,
			22,
			28,
			34
		],
		8: [
			12,
			18,
			24,
			30,
			36
		],
		9: [
			14,
			20,
			26,
			32,
			38
		],
		10: [
			16,
			22,
			28,
			34,
			40
		],
		11: [
			18,
			24,
			30,
			36,
			42
		],
		12: [
			20,
			26,
			32,
			38,
			44
		],
		13: [
			22,
			28,
			34,
			40,
			46
		],
		14: [
			24,
			30,
			36,
			42,
			48
		],
		15: [
			26,
			32,
			38,
			44,
			50
		],
		16: [
			28,
			34,
			40,
			46,
			52
		],
		17: [
			30,
			36,
			42,
			48,
			54
		]
	},
	female: {
		6: [
			6,
			12,
			18,
			24,
			30
		],
		7: [
			8,
			14,
			20,
			26,
			32
		],
		8: [
			10,
			16,
			22,
			28,
			34
		],
		9: [
			12,
			18,
			24,
			30,
			36
		],
		10: [
			14,
			20,
			26,
			32,
			38
		],
		11: [
			16,
			22,
			28,
			34,
			40
		],
		12: [
			18,
			24,
			30,
			36,
			42
		],
		13: [
			18,
			24,
			30,
			36,
			42
		],
		14: [
			19,
			25,
			31,
			37,
			43
		],
		15: [
			20,
			26,
			32,
			38,
			44
		],
		16: [
			20,
			26,
			32,
			38,
			44
		],
		17: [
			21,
			27,
			33,
			39,
			45
		]
	}
};
var JUMP = {
	male: {
		6: [
			80,
			95,
			110,
			125,
			140
		],
		7: [
			90,
			105,
			120,
			135,
			150
		],
		8: [
			100,
			115,
			130,
			145,
			160
		],
		9: [
			110,
			125,
			140,
			155,
			170
		],
		10: [
			120,
			135,
			150,
			165,
			180
		],
		11: [
			125,
			140,
			155,
			170,
			190
		],
		12: [
			130,
			145,
			160,
			180,
			200
		],
		13: [
			140,
			155,
			170,
			190,
			210
		],
		14: [
			150,
			165,
			180,
			200,
			220
		],
		15: [
			160,
			175,
			190,
			210,
			230
		],
		16: [
			170,
			185,
			200,
			220,
			240
		],
		17: [
			175,
			190,
			210,
			225,
			245
		]
	},
	female: {
		6: [
			75,
			90,
			105,
			120,
			135
		],
		7: [
			85,
			100,
			115,
			130,
			145
		],
		8: [
			95,
			110,
			125,
			140,
			155
		],
		9: [
			100,
			115,
			130,
			145,
			160
		],
		10: [
			105,
			120,
			135,
			150,
			165
		],
		11: [
			110,
			125,
			140,
			155,
			170
		],
		12: [
			115,
			130,
			145,
			160,
			175
		],
		13: [
			120,
			135,
			150,
			165,
			180
		],
		14: [
			125,
			140,
			155,
			170,
			185
		],
		15: [
			125,
			140,
			155,
			170,
			190
		],
		16: [
			130,
			145,
			160,
			175,
			195
		],
		17: [
			130,
			145,
			160,
			175,
			195
		]
	}
};
var MBALL = {
	male: {
		6: [
			1.5,
			2,
			2.5,
			3,
			3.6
		],
		7: [
			1.7,
			2.2,
			2.8,
			3.4,
			4
		],
		8: [
			1.9,
			2.5,
			3.1,
			3.7,
			4.4
		],
		9: [
			2.1,
			2.7,
			3.4,
			4,
			4.7
		],
		10: [
			2.3,
			3,
			3.7,
			4.3,
			5
		],
		11: [
			2.5,
			3.3,
			4,
			4.7,
			5.5
		],
		12: [
			2.8,
			3.6,
			4.3,
			5,
			5.8
		],
		13: [
			3,
			3.9,
			4.7,
			5.5,
			6.3
		],
		14: [
			3.4,
			4.3,
			5.2,
			6,
			7
		],
		15: [
			3.8,
			4.7,
			5.7,
			6.7,
			7.7
		],
		16: [
			4,
			5,
			6,
			7,
			8
		],
		17: [
			4.3,
			5.4,
			6.5,
			7.5,
			8.5
		]
	},
	female: {
		6: [
			1.3,
			1.8,
			2.2,
			2.7,
			3.2
		],
		7: [
			1.5,
			2,
			2.5,
			3,
			3.5
		],
		8: [
			1.7,
			2.2,
			2.7,
			3.3,
			3.9
		],
		9: [
			1.9,
			2.4,
			3,
			3.6,
			4.2
		],
		10: [
			2,
			2.6,
			3.2,
			3.9,
			4.5
		],
		11: [
			2.2,
			2.8,
			3.5,
			4.2,
			4.9
		],
		12: [
			2.4,
			3,
			3.7,
			4.5,
			5.2
		],
		13: [
			2.5,
			3.2,
			3.9,
			4.7,
			5.5
		],
		14: [
			2.7,
			3.4,
			4.1,
			4.9,
			5.7
		],
		15: [
			2.8,
			3.5,
			4.3,
			5,
			5.8
		],
		16: [
			2.9,
			3.6,
			4.4,
			5.2,
			6
		],
		17: [
			3,
			3.7,
			4.5,
			5.3,
			6.1
		]
	}
};
var SQUARE = {
	male: {
		6: [
			8.5,
			7.8,
			7.2,
			6.6,
			6
		],
		7: [
			8.2,
			7.5,
			6.9,
			6.3,
			5.8
		],
		8: [
			7.8,
			7.2,
			6.6,
			6.1,
			5.6
		],
		9: [
			7.5,
			6.9,
			6.4,
			5.9,
			5.4
		],
		10: [
			7.2,
			6.7,
			6.2,
			5.7,
			5.2
		],
		11: [
			7,
			6.5,
			6,
			5.5,
			5
		],
		12: [
			6.8,
			6.3,
			5.8,
			5.3,
			4.9
		],
		13: [
			6.6,
			6.1,
			5.6,
			5.2,
			4.8
		],
		14: [
			6.4,
			5.9,
			5.5,
			5.1,
			4.7
		],
		15: [
			6.2,
			5.8,
			5.4,
			5,
			4.6
		],
		16: [
			6.1,
			5.7,
			5.3,
			4.9,
			4.5
		],
		17: [
			6,
			5.6,
			5.2,
			4.8,
			4.4
		]
	},
	female: {
		6: [
			9,
			8.3,
			7.6,
			7,
			6.4
		],
		7: [
			8.7,
			8,
			7.4,
			6.8,
			6.2
		],
		8: [
			8.4,
			7.7,
			7.1,
			6.5,
			6
		],
		9: [
			8.1,
			7.4,
			6.8,
			6.3,
			5.8
		],
		10: [
			7.8,
			7.2,
			6.6,
			6.1,
			5.6
		],
		11: [
			7.6,
			7,
			6.4,
			5.9,
			5.4
		],
		12: [
			7.4,
			6.8,
			6.3,
			5.8,
			5.3
		],
		13: [
			7.2,
			6.7,
			6.2,
			5.7,
			5.2
		],
		14: [
			7.1,
			6.6,
			6.1,
			5.6,
			5.2
		],
		15: [
			7,
			6.5,
			6,
			5.6,
			5.1
		],
		16: [
			6.9,
			6.4,
			6,
			5.5,
			5.1
		],
		17: [
			6.9,
			6.4,
			6,
			5.5,
			5.1
		]
	}
};
var SPRINT = {
	male: {
		6: [
			5.5,
			5,
			4.6,
			4.2,
			3.9
		],
		7: [
			5.2,
			4.8,
			4.4,
			4,
			3.7
		],
		8: [
			5,
			4.6,
			4.2,
			3.9,
			3.6
		],
		9: [
			4.8,
			4.4,
			4.1,
			3.8,
			3.5
		],
		10: [
			4.7,
			4.3,
			4,
			3.7,
			3.4
		],
		11: [
			4.6,
			4.2,
			3.9,
			3.6,
			3.3
		],
		12: [
			4.5,
			4.1,
			3.8,
			3.5,
			3.2
		],
		13: [
			4.3,
			4,
			3.7,
			3.4,
			3.1
		],
		14: [
			4.2,
			3.9,
			3.6,
			3.3,
			3
		],
		15: [
			4.1,
			3.8,
			3.5,
			3.2,
			2.9
		],
		16: [
			4,
			3.7,
			3.4,
			3.1,
			2.9
		],
		17: [
			4,
			3.7,
			3.4,
			3.1,
			2.9
		]
	},
	female: {
		6: [
			5.8,
			5.3,
			4.9,
			4.5,
			4.1
		],
		7: [
			5.5,
			5.1,
			4.7,
			4.3,
			4
		],
		8: [
			5.3,
			4.9,
			4.5,
			4.2,
			3.9
		],
		9: [
			5.1,
			4.7,
			4.4,
			4.1,
			3.8
		],
		10: [
			5,
			4.6,
			4.3,
			4,
			3.7
		],
		11: [
			4.9,
			4.5,
			4.2,
			3.9,
			3.6
		],
		12: [
			4.8,
			4.4,
			4.1,
			3.8,
			3.5
		],
		13: [
			4.7,
			4.3,
			4,
			3.7,
			3.5
		],
		14: [
			4.7,
			4.3,
			4,
			3.7,
			3.5
		],
		15: [
			4.6,
			4.3,
			4,
			3.7,
			3.5
		],
		16: [
			4.6,
			4.3,
			4,
			3.7,
			3.5
		],
		17: [
			4.6,
			4.3,
			4,
			3.7,
			3.5
		]
	}
};
var RUN6 = {
	male: {
		6: [
			600,
			750,
			900,
			1050,
			1200
		],
		7: [
			650,
			800,
			950,
			1100,
			1250
		],
		8: [
			700,
			850,
			1e3,
			1150,
			1300
		],
		9: [
			750,
			900,
			1050,
			1200,
			1350
		],
		10: [
			800,
			950,
			1100,
			1250,
			1400
		],
		11: [
			850,
			1e3,
			1150,
			1300,
			1450
		],
		12: [
			900,
			1050,
			1200,
			1350,
			1500
		],
		13: [
			950,
			1100,
			1250,
			1400,
			1550
		],
		14: [
			1e3,
			1150,
			1300,
			1450,
			1600
		],
		15: [
			1050,
			1200,
			1350,
			1500,
			1650
		],
		16: [
			1100,
			1250,
			1400,
			1550,
			1700
		],
		17: [
			1150,
			1300,
			1450,
			1600,
			1750
		]
	},
	female: {
		6: [
			550,
			700,
			850,
			1e3,
			1150
		],
		7: [
			600,
			750,
			900,
			1050,
			1200
		],
		8: [
			650,
			800,
			950,
			1100,
			1250
		],
		9: [
			700,
			850,
			1e3,
			1150,
			1300
		],
		10: [
			750,
			900,
			1050,
			1200,
			1350
		],
		11: [
			800,
			950,
			1100,
			1250,
			1400
		],
		12: [
			850,
			1e3,
			1150,
			1300,
			1450
		],
		13: [
			850,
			1e3,
			1150,
			1300,
			1450
		],
		14: [
			850,
			1e3,
			1150,
			1300,
			1450
		],
		15: [
			850,
			1e3,
			1150,
			1300,
			1450
		],
		16: [
			850,
			1e3,
			1150,
			1300,
			1450
		],
		17: [
			850,
			1e3,
			1150,
			1300,
			1450
		]
	}
};
var TEST_META = {
	imc: {
		label: "IMC",
		unit: "kg/m²",
		field: "imc",
		better: "health"
	},
	rce: {
		label: "RCE",
		unit: "",
		field: "rce",
		better: "health"
	},
	flex: {
		label: "Flexibilidade",
		unit: "cm",
		field: "sit_and_reach_cm",
		better: "higher"
	},
	abdo: {
		label: "Abdominal 1min",
		unit: "reps",
		field: "abdominal_reps",
		better: "higher"
	},
	jump: {
		label: "Salto Horizontal",
		unit: "cm",
		field: "horizontal_jump_cm",
		better: "higher"
	},
	mball: {
		label: "Medicine Ball 2kg",
		unit: "m",
		field: "medicine_ball_m",
		better: "higher"
	},
	square: {
		label: "Agilidade (Quadrado)",
		unit: "s",
		field: "square_test_s",
		better: "lower"
	},
	sprint: {
		label: "Velocidade 20m",
		unit: "s",
		field: "sprint_20m_s",
		better: "lower"
	},
	run6: {
		label: "Corrida 6min",
		unit: "m",
		field: "run_6min_m",
		better: "higher"
	}
};
function classifyHigherTable(val, table, sex, age) {
	if (val == null) return null;
	const cuts = pickCut(table, sex, age);
	if (!cuts) return null;
	return classifyHigher(val, cuts);
}
function classifyLowerTable(val, table, sex, age) {
	if (val == null) return null;
	const cuts = pickCut(table, sex, age);
	if (!cuts) return null;
	return classifyLower(val, cuts);
}
function classifyAll(e) {
	const imc = calcImc(e.weight_kg, e.height_cm);
	const rce = calcRce(e.waist_cm, e.height_cm);
	return {
		imc: imcZone(imc, e.age, e.sex) ?? void 0,
		rce: rceZone(rce) ?? void 0,
		flex: classifyHigherTable(e.sit_and_reach_cm, FLEX, e.sex, e.age) ?? void 0,
		abdo: classifyHigherTable(e.abdominal_reps, ABDO, e.sex, e.age) ?? void 0,
		jump: classifyHigherTable(e.horizontal_jump_cm, JUMP, e.sex, e.age) ?? void 0,
		mball: classifyHigherTable(e.medicine_ball_m, MBALL, e.sex, e.age) ?? void 0,
		square: classifyLowerTable(e.square_test_s, SQUARE, e.sex, e.age) ?? void 0,
		sprint: classifyLowerTable(e.sprint_20m_s, SPRINT, e.sex, e.age) ?? void 0,
		run6: classifyHigherTable(e.run_6min_m, RUN6, e.sex, e.age) ?? void 0
	};
}
function zoneScore(z) {
	if (!z) return 0;
	return ZONES.indexOf(z) + 1;
}
function overallScore(c) {
	const vals = Object.values(c).filter(Boolean);
	const filled = vals.length;
	const partial = filled < 4;
	if (filled === 0) return {
		score: 0,
		label: null,
		filled,
		partial: true
	};
	const avg = vals.reduce((a, z) => a + zoneScore(z), 0) / filled;
	const idx = Math.min(5, Math.max(0, Math.round(avg) - 1));
	return {
		score: +avg.toFixed(2),
		label: partial ? null : ZONES[idx],
		filled,
		partial
	};
}
var TABLE_BY_KEY = {
	flex: FLEX,
	abdo: ABDO,
	jump: JUMP,
	mball: MBALL,
	square: SQUARE,
	sprint: SPRINT,
	run6: RUN6
};
function expectedRangeFor(key, age, sex) {
	if (key === "imc") {
		if (age >= 18) return {
			min: 18.5,
			max: 24.9,
			domainMin: 14,
			domainMax: 32,
			higherBetter: false
		};
		const base = sex === "male" ? [15.5, 22.5] : [15, 22.5];
		return {
			min: base[0],
			max: base[1],
			domainMin: 12,
			domainMax: 30,
			higherBetter: false
		};
	}
	if (key === "rce") return {
		min: .4,
		max: .5,
		domainMin: .3,
		domainMax: .7,
		higherBetter: false
	};
	const table = TABLE_BY_KEY[key];
	const cuts = pickCut(table, sex, Math.floor(Math.max(6, Math.min(17, age))));
	if (!cuts) return null;
	const higherBetter = !(key === "square" || key === "sprint");
	const min = Math.min(cuts[1], cuts[4]);
	const max = Math.max(cuts[1], cuts[4]);
	const lo = Math.min(cuts[0], cuts[4]);
	const hi = Math.max(cuts[0], cuts[4]);
	const pad = (hi - lo) * .15;
	return {
		min,
		max,
		domainMin: lo - pad,
		domainMax: hi + pad,
		higherBetter
	};
}
//#endregion
export { calcRce as a, overallScore as c, calcImc as i, zoneColor as l, ZONES as n, classifyAll as o, ageFromBirth as r, expectedRangeFor as s, TEST_META as t, zoneScore as u };
