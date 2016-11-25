const Discord = require("discord.js"),
	configs = require("../modules/serverconfigs.js"),
	Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");

const bot = Oxyl.bot,
	config = framework.config,
	commands = framework.commands,
	consoleLog = framework.consoleLog,
	prefix = new RegExp(config.options.prefixRegex, "i");

const spamData = {};

bot.on("message", (message) => {
	var cmd, type;
	let guild = message.guild;
	let guildConfig = configs.getConfig(guild);
	let msg = message.content.toLowerCase();

	if(guildConfig.channels.ignored.value.includes(message.channel.id)) {
		return;
	} else if(message.author.bot) {
		return;
	} else if(!message.channel.type === "text") {
		message.reply("Oxyl only supports commands within guilds");
	} else {
		if(!message.member) {
			guild.fetchMember(message.author);
			return;
		} else {
			var roles = message.member.roles;
		}

		if(msg.match(prefix) && msg.match(prefix)[2]) {
			message.content = message.content.match(prefix)[2];

			let cmdInfo = framework.getCmd(message.content);
			if(cmdInfo.cmd) {
				cmd = cmdInfo.cmd;
				type = cmdInfo.type;

				message.contentPreserved = cmdInfo.newContent;
				msg = message.contentPreserved.toLowerCase();
				message.content = msg;
			} else {
				message.contentPreserved = message.content;
				message.content = msg;
			}
		}

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
						message.author.sendMessage(`Please do not send links in **${guild.name}**, it is not allowed.`);
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
			consoleLog(`[${framework.formatDate(new Date())}] ` +
        `${message.author.username}#${message.author.discriminator} ran \`${cmd}\`
        in **${guild.name}**`, "cmd");
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
