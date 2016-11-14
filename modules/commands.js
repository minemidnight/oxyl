const Discord = require("discord.js"),
	Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const bot = Oxyl.bot, config = framework.config,
	commands = framework.commands, consoleLog = framework.consoleLog;

bot.on("message", (message) => {
	var cmd, type;
	var prefix = config.options.prefix;
	var suffix = config.options.suffix;
	if(message.author.bot) {
		return;
	} else if(message.channel.type === "dm") {
		message.reply("Oxyl does not support DM's");
	} else {
		var msg = message.content.toLowerCase();
		for(var cmdType in commands) {
			for(var loopCmd in commands[cmdType]) {
				if(msg.startsWith(prefix + loopCmd) || msg.startsWith(loopCmd + suffix)) {
					message.content = message.content.substring(loopCmd.length + 1, message.content.length);
					cmd = loopCmd;
					type = cmdType;
					break;
				} else {
					var aliases = commands[cmdType][loopCmd].aliases;
					for(var i = 0; i < aliases.length; i++) {
						var alias = aliases[i];
						if(msg.startsWith(prefix + alias) || msg.startsWith(alias + suffix)) {
							message.content = message.content.substring(alias.length + 1, message.content.length);
							cmd = loopCmd;
							type = cmdType;
							break;
						}
					}
				}
			}
		}
		message.content = message.content.startsWith(" ") ? message.content.substring(1) : message.content;
    // remove space after command to split for args
		if(!cmd) 	return;
		if(type === "creator") {
			if(!config.creators.includes(message.author.id)) {
				message.reply(config.messages.notCreator);
				return;
			}
		} else if(type === "moderator") {
			let accepted = ["bot commander"];
			let isMod;
			let roles = message.member.roles.array();
			for(var index = 0; index < roles.length; index++) {
				if(accepted.includes(roles[index].name.toLowerCase())) {
					isMod = true;
					break;
				}
			}
			if(!isMod) {
				message.reply(config.messages.notMod);
				return;
			}
		}

		try {
			var result = commands[type][cmd].process(message, bot);
			message.content = message.content === "" ? message.content = "no args" : `\`${message.content}\``;
			consoleLog(`[${framework.formatDate(new Date())}]
        ${message.author.username}#${message.author.discriminator} ran \`${cmd}\`
        with arguments \`${message.content}\``, "cmd");
		} catch(error) {
			consoleLog(`Failed command ${cmd} (${type})\n` +
        `**Error:** ${framework.codeBlock(error.stack)}`, "debug");
		} finally {
			if(result) {
				message.reply(result, { split: true });
			}
		}
	}
});
