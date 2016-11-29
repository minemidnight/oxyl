const configs = require("../modules/serverconfigs.js"),
	validator = require("../moudles/commandArgs.js"),
	Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");

const bot = Oxyl.bot,
	config = framework.config,
	commands = framework.commands,
	consoleLog = framework.consoleLog,
	prefix = new RegExp(config.options.prefixRegex, "im");

const spamData = {};

bot.on("message", (message) => {
	let guild = message.guild;
	let msg = message.content.toLowerCase();

	if(message.author.bot) {
		return;
	} else if(!message.channel.type === "text") {
		message.reply("Oxyl only supports commands within guilds");
	} else {
		let guildConfig = configs.getConfig(guild);
		if(guildConfig.channels.ignored.value.includes(message.channel.id)) return;
		if(!message.member) {
			guild.fetchMember(message.author);
			return;
		} else {
			var roles = message.member.roles;
		}

		if(msg.match(prefix) && msg.match(prefix)[2]) {
			message.content = message.content.match(prefix)[2];

			let cmdInfo = framework.getCmd(message.content);
			var command = cmdInfo.cmd;
			if(command) {
				message.contentPreserved = cmdInfo.newContent;
				msg = message.contentPreserved.toLowerCase();
				message.content = msg;
			} else {
				message.contentPreserved = message.content;
				message.content = msg;
			}
		}

		if(!command) {
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
		if(command.type === "creator") {
			if(!config.creators.includes(message.author.id)) {
				message.reply(config.messages.notCreator);
				return;
			}
		} else if(command.type === "moderator") {
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
		} else if(command.type === "guild owner") {
			if(message.author.id !== guild.owner.id) {
				message.reply(config.messages.notGuildOwner);
				return;
			}
		} else if(command.type === "music") {
			let musicText = guildConfig.channels.musicText.value;
			if(musicText && musicText !== message.channel.id) {
				message.reply(config.messages.notMusicChannel);
				return;
			}
		}

		let args = command.args;
		let arguments = message.content.split(" ", args.length);
		let argCheck = 0;

		let i = -1, nth = args.length;
		while(nth-- && i++ < message.content.length) {
			i = message.content.indexOf(" ", i);
			if(i < 0) break;
		}
		arguments.push(message.content.substring(i));
		message.argsPreserved = arguments;
		message.args = arguments.map(ele => ele.toLowerCase());

		validateArgs(message, command)
		.then(newMsg => {
			message = newMsg;
			try {
				var result = command.run(message);
				consoleLog(`[${framework.formatDate(new Date())}] ${framework.unmention(message.author)} ran \`${command.name}\` in **${guild.name}**`, "cmd");
			} catch(error) {
				consoleLog(`Failed command ${command.name} (${command.type})\n` +
				`**Error:** ${framework.codeBlock(error.stack)}`, "debug");
			} finally {
				if(result) message.reply(result, { split: true });
			}
		}).catch(reason => message.reply(reason));
	}
});

function checkArg(input, arg) {
	return new Promise((resolve, reject) => {
		if(!arg && !arg.optional && arg.type !== "custom") reject(`No input given for ${arg.label} (${arg.type})`);
		validator.test(input, arg)
		.then(value => resolve(value))
		.catch(reason => reject(reason));
	});
}

function validateArgs(message, command, index) {
	if(index === undefined) index = 0;
	return new Promise((resolve, reject) => {
		if(index === command.args.length) resolve(message);
		checkArg(message.args[index], command.args[index]).then(newArg => {
			message.args[index] = newArg;
			message.argsCase[index] = newArg.toLowerCase();
			validateArgs(message, command, index + 1);
		}).catch(reason => {
			message.reply(`${reason}\nYou have 15 seconds to supply another argument, or it will time out`);
			let await = message.channel.awaitMessage(newMsg => {
				if(newMsg.author.id === message.author.id) {
					return true;
				} else {
					return false;
				}
			}, { maxMatches: 1, time: 15000 })
			.then(responses => {
				if(!responses || responses.size === 0) reject("Command timed out");
				checkArg(message.args[index], command.args[index]).then(newArg => {
					message.args[index] = newArg;
					message.argsCase[index] = newArg.toLowerCase();
					validateArgs(message, command, index + 1);
				}).catch(reason2 => reject(reason2));
			});
		});
	});
}
