exports.cmd = new Oxyl.Command("reload", async message => {
	message.content = message.content.toLowerCase();
	let reload = framework.findFile(["./commands/", "./modules/", "./site/"], message.args[0], "js");

	if(!reload) {
		return `Invalid file: ${message.args[0]}`;
	} else {
		framework.loadScript(reload[0] + reload[1]);
		return `Reloaded script \`${reload[1]}\` **(**${reload[0]}${reload[1]}**)**`;
	}
}, {
	type: "creator",
	description: "Reload commands or modules",
	args: [{
		type: "text",
		label: "command/module name"
	}]
});
