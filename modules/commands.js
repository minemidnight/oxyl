const Discord = require("discord.js"),
	configs = require("../modules/serverconfigs.js"),
	Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");

const bot = Oxyl.bot,
	config = framework.config,
	commands = framework.commands,
	consoleLog = framework.consoleLog,
	prefix = config.options.prefix,
	suffix = config.options.suffix;

const spamData = {};

bot.on("message", (message) => {
	var cmd, type;
	let roles = message.member.roles;
	let guild = message.guild;
	let guildConfig = configs.getConfig(guild);
	let msg = message.content.toLowerCase();

	if(guildConfig.channels.ignored.value.includes(message.channel.id)) {
		return;
	} else if(message.author.bot) {
		return;
	} else if(message.channel.type === "dm") {
		message.reply("Oxyl does not support commands within DM's");
	} else {
		for(var cmdType in commands) {
			for(var loopCmd in commands[cmdType]) {
				if(msg.startsWith(prefix + loopCmd) || msg.startsWith(loopCmd + suffix)) {
					message.content = message.content.substring(loopCmd.length + 1, message.content.length);
					cmd = loopCmd;
					type = cmdType;
					break;
				} else {
					var aliases = commands[cmdType][loopCmd].aliases;
					for(let i = 0; i < aliases.length; i++) {
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

		if(!cmd) {
			let whitelisted = guildConfig.roles.whitelist.value;
			let whitelistedRole = roles.find(role => {
				if(whitelisted.includes(role.id)) {
					return true;
				} else {
					return false;
				}
			});

			if(!whitelistedRole) {
				let link = guildConfig.filters.link.value;
				let spam = guildConfig.filters.spam.value;

				if(link) {
					let linkFilter = new RegExp(config.options.linkFilter);
					if(linkFilter.test(message.content)) {
						message.delete();
						message.author.sendMessage(`Please do not send links in **${guild}**, it is not allowed.`);
					}
				}

				if(spam) {
					if(!spamData[guild.id]) {
						spamData[guild.id] = [];
					}

					let lastMessage = spamData[guild.id][message.author.id];

					if(lastMessage && lastMessage.length > 7 &&
						Math.abs(lastMessage.length - msg.length) < 5 &&
						lastMessage.substring(0, msg.length) === lastMessage) {
						message.delete();
						message.author.sendMessage(`Please do not spam in **${guild}**, it is not allowed.`);
					}

					spamData[guild.id][message.author.id] = msg;
				}
			}

			return;
		}
		if(type === "creator") {
			if(!config.creators.includes(message.author.id)) {
				message.reply(config.messages.notCreator);
				return;
			}
		} else if(type === "moderator") {
			let accepted = guildConfig.roles.mod.value;
			let modRole = roles.find(role => {
				if(accepted.includes(role.id) || role.name.toLowerCase() === "bot commander") {
					return true;
				} else {
					return false;
				}
			});

			if(!modRole) {
				message.reply(config.messages.notMod);
				return;
			}
		} else if(type === "guild owner") {
			if(message.author.id !== guild.owner.id) {
				message.reply(config.messages.notGuildOwner);
				return;
			}
		} else if(type === "music") {
			let musicText = guildConfig.channels.musicText.value;
			if(musicText && musicText !== message.channel.id) {
				message.reply(config.messages.notMusicChannel);
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
