const Discord = require("discord.js"),
	Oxyl = require("../oxyl.js");
const bot = Oxyl.bot, config = Oxyl.config,
	commands = Oxyl.commands, consoleLog = Oxyl.consoleLog;

bot.on("message", (message) => {
	var cmd, type;
	var prefix = config.options.prefix;
	var suffix = config.options.suffix;
	if(message.author.bot) {
		return;
	} else {
		var msg = message.content.toLowerCase();
		for(var cmdType in commands) {
			for(var loopCmd in commands[cmdType]) {
				if(msg.startsWith(prefix + loopCmd) || msg.startsWith(loopCmd + suffix)) {
					message.content = message.content.replace(prefix + loopCmd, "");
					message.content = message.content.replace(loopCmd + suffix, "");
          // remove the command from the passed message
					cmd = loopCmd;
					type = cmdType;
					break;
				} else {
					var aliases = commands[cmdType][loopCmd].aliases;
					for(var i = 0; i < aliases.length; i++) {
						var alias = aliases[i];
						if(msg.startsWith(prefix + alias) || msg.startsWith(alias + suffix)) {
							message.content = message.content.replace(prefix + alias, "");
							message.content = message.content.replace(alias + suffix, "");
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
		if(!cmd) {
			return;
		}
		if(type === "creator") {
			if(!config.creators.includes(message.author.id)) {
				message.reply(config.messages.notCreator);
				return;
			}
		} else if(type === "moderator") {
			var accepted = ["bot commander"], isMod;
			var roles = message.member.roles.array();
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
		} else if(type === "dm") {
			if(message.channel.type === "dm") {
				consoleLog(`**${message.author.username}** - ${message.content}`, "dm");
			} else {
				return;
			}
		}
		try {
			var result = commands[type][cmd].process(message, bot);
			message.content = message.content === "" ? message.content = " " : message.content;
      // To make logging actually show a codeblock
			consoleLog(`[${Oxyl.formatDate(new Date())}]
        ${message.author.username}#${message.author.discriminator} ran \`${cmd}\`
        with arguments \`${message.content}\``, "cmd");
		} catch(error) {
			consoleLog(`Failed a ${type} command (${cmd})\n` +
        `**Error:** ${Oxyl.codeBlock(error.stack)}`, "debug");
		}
		if(result) {
			message.reply(result, { split: true });
		}
	}
});
