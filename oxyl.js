const Eris = require("eris"),
	framework = require("./framework.js");

const bot = new Eris(framework.config.private.token);

process.stdin.resume();
process.on("SIGINT", () => {
	exports.modScripts.music.managerDump();
	Object.keys(exports.managers)
	.map(man => exports.managers[man])
	.filter(man => man.data.playing && man.musicChannel)
	.forEach(man => man.sendEmbed("restart"));

	setTimeout(() => {
		bot.disconnect({ reconnect: false });
		process.exit();
	}, 5000);
});

process.on("unhandledRejection", (err) => {
	if(!err) return;
	if(err.code === 50013 || err.code === 10008) {
		console.log(err);
	} else {
		err = err.stack.substring(0, 1900) || err;
		framework.consoleLog(`Unhandled Rejection: ${framework.codeBlock(err)}`, "debug");
	}
});

exports.addCommand = (command) => {
	if(!exports.commands[command.type]) exports.commands[command.type] = {};
	exports.commands[command.type][command.name] = command;
};

exports.bot = bot;
exports.commands = {};

exports.cmdScripts = framework.loadScripts("./commands/");
exports.modScripts = framework.loadScripts("./modules/");
exports.siteScripts = framework.loadScripts("./site/");
exports.managers = {};

exports.postStats = require("./modules/statPoster.js");
setInterval(() => exports.postStats(), 1800000);
