const Eris = require("eris");
global.framework = require("./framework.js");
global.Promise = require("bluebird");

global.bot = new Eris(framework.config.private.token, {
	maxShards: framework.config.shards,
	messageLimit: 0,
	disableEvents: { TYPING_START: true }
});

process.stdin.resume();
process.on("SIGINT", () => {
	exports.statsd.timing(`oxyl.uptime`, bot.uptime);
	exports.modScripts.music.managerDump();
	Object.keys(exports.managers)
	.map(man => exports.managers[man])
	.filter(man => man.data.playing)
	.forEach(man => man.sendEmbed("restart"));

	setTimeout(() => {
		bot.disconnect({ reconnect: false });
		process.exit(0);
	}, 5000);
});

process.on("unhandledRejection", err => {
	if(!err) return;
	try {
		let resp = JSON.parse(err.response);
		// these codes mean someone bamboozled oxyl's perms or someone's bamboozled their server
		if(resp.code === 50013 || resp.code === 10008 || resp.code === 50001 || resp.code === 40005 || resp.code === 10003) return;
		else throw err;
	} catch(err2) {
		exports.statsd.increment(`oxyl.errors`);
		err = err.stack.substring(0, 1900) || err;
		framework.consoleLog(`Unhandled Rejection: ${framework.codeBlock(err)}`, "debug");
	}
});

process.on("uncaughtException", err => {
	if(!err) return;
	if(err.code === "ECONNRESET" && err.message === "socket hang up") {
		framework.consoleLog("Socket Hang Up", "debug");
		return;
	}

	exports.statsd.increment(`oxyl.errors`);
	err = err.stack.substring(0, 1900) || err;
	framework.consoleLog(`__**Uncaught Exception**__: ${framework.codeBlock(err)}`, "debug");

	exports.statsd.timing(`oxyl.uptime`, bot.uptime);
	exports.modScripts.music.managerDump();
	Object.keys(exports.managers)
	.map(man => exports.managers[man])
	.filter(man => man.data.playing)
	.forEach(man => man.sendEmbed("restart"));

	setTimeout(() => {
		bot.disconnect({ reconnect: false });
		process.exit(0);
	}, 5000);
});


bot.on("error", (err, shardid) => {
	if(!err) return;
	exports.statsd.increment(`oxyl.errors`);
	err = err.stack.substring(0, 1900) || err;
	framework.consoleLog(`__**Shard Error ${shardid}**__: ${framework.codeBlock(err)}`, "debug");
});

bot.on("shardReady", shardid => framework.consoleLog(`Shard ${shardid} ready`));

exports.commands = {};
exports.addCommand = (command) => {
	if(!exports.commands[command.type]) exports.commands[command.type] = {};
	exports.commands[command.type][command.name] = command;
};

const StatsD = require("hot-shots");
exports.statsd = new StatsD();

exports.Command = require("./modules/commandCreator.js");
exports.modScripts = {};
exports.cmdScripts = {};
exports.siteScripts = {};
exports.managers = {};

framework.loadScripts("./modules/");
framework.loadScripts("./commands/");
framework.loadScripts("./site/");

exports.postStats = require("./modules/statPoster.js");
setInterval(() => exports.postStats(), 1800000);
setInterval(() => {
	let heapUsed = (process.memoryUsage().heapUsed / Math.pow(1024, 2)).toFixed(2);
	exports.statsd.gauge(`oxyl.heapUsed`, heapUsed);
	bot.shards.forEach(shard => {
		exports.statsd.timing(`oxyl.latency.${shard.id}`, shard.latency);
		exports.statsd.timing(`oxyl.latency`, shard.latency);
	});
}, 120000);
