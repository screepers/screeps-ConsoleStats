var statsConsole = require("statsConsole");
// sample data format ["Name for Stat", variableForStat]
let myStats = [
	["Creep Managers", CreepManagersCPUUsage],
	["Towers", towersCPUUsage],
	["Links", linksCPUUsage],
	["Setup Roles", SetupRolesCPUUsage],
	["Creeps", CreepsCPUUsage],
	["Init", initCPUUsage],
	["Stats", statsCPUUsage],
	["Total", totalCPUUsage]
];

statsConsole.run(myStats); // Run Stats collection
if (totalTime > Game.cpu.limit) {
	statsConsole.log("Tick: " + Game.time + "  CPU OVERRUN: " + Game.cpu.getUsed().toFixed(2) + "  Bucket:" + Game.cpu.bucket, 5);
}
if ((Game.time % 5) === 0) {
	console.log(statsConsole.displayHistogram());
	console.log(statsConsole.displayStats());
	console.log(statsConsole.displayLogs());
	//console.log(statsConsole.displayMaps()); // Don't use as it will consume ~30-40 CPU
	totalTime = (Game.cpu.getUsed() - totalTime);
	console.log("Time to Draw: " + totalTime.toFixed(2));
}
