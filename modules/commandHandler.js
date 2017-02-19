const commands = Oxyl.commands;
const prefixes = exports.prefixes = {};
const musicchannels = exports.musicchannels = {};
const blacklist = exports.blacklist = [];
const cleverchannels = exports.clever = [];
const ignored = exports.ignored = [];
// wait for connection
exports.updateThings = async () => {
	let prefixArray = await framework.dbQuery("SELECT * FROM `Settings` WHERE `NAME` = 'prefix'");
	prefixArray.forEach(data => {
		prefixes[data.ID] = data.VALUE;
	});

	let blacklistedUsers = await framework.dbQuery("SELECT * FROM `Blacklist`");
	blacklistedUsers.forEach(data => {
		blacklist.push(data.USER);
	});

	let cleverChannels = await framework.dbQuery("SELECT * FROM `Settings` WHERE `NAME` = 'cleverbot'");
	cleverChannels.forEach(data => {
		cleverchannels.push(data.VALUE);
	});

	let musicChannels = await framework.dbQuery("SELECT * FROM `Settings` WHERE `NAME` = 'musicchannel'");
	musicChannels.filter(data => bot.guilds.has(data.ID) && bot.guilds.get(data.ID).channels.has(data.VALUE))
	.forEach(data => {
		musicchannels[data.ID] = bot.guilds.get(data.ID).channels.get(data.VALUE);
	});

	let ignoredChannels = await framework.dbQuery("SELECT `CHANNEL` FROM `Ignored`");
	ignoredChannels.forEach(data => {
		ignored.push(data.CHANNEL);
	});
};

bot.on("messageCreate", async (message) => {
	Oxyl.siteScripts.website.messageCreate(message);
	let guild = message.channel.guild;
	let msg = message.content.toLowerCase();
	if(message.author.bot || blacklist.indexOf(message.author.id) !== -1) return;
	else if(ignored.indexOf(message.channel.id) !== -1 && framework.guildLevel(message.member) < 3) return;

	let prefix = "^(o!|oxyl|<@!?255832257519026178>|<:oxyl_square:273616293775540224>|<:oxyl:273616986121043968>{GPRE}),?(?:\\s+)?([\\s\\S]+)";
	if(guild && prefixes[guild.id]) prefix = prefix.replace("{GPRE}", `|${framework.escapeRegex(prefixes[guild.id])}`);
	else prefix = prefix.replace("{GPRE}", "");
	prefix = new RegExp(prefix, "i");

	let match = message.content.match(prefix);
	if(match && match[2]) {
		let type = match[1];
		message.content = match[2];

		let cmdInfo = framework.getCmd(message.content);
		var command = cmdInfo.cmd;
		if(command) {
			message.contentPreserved = cmdInfo.newContent;
			msg = message.contentPreserved.toLowerCase();
			message.content = msg;
		} else if(guild) {
			if(guild && guild.id === "254768930223161344") console.log("yes guild checking for custom");
			msg = message.content.toLowerCase();
			let cmdCheck;
			if(msg.indexOf(" ") === -1) cmdCheck = msg;
			else cmdCheck = msg.substring(0, msg.indexOf(" "));
			if(guild && guild.id === "254768930223161344") console.log(cmdCheck);

			let cc = await framework.getCC(message.channel.guild.id, cmdCheck);
			if(guild && guild.id === "254768930223161344") console.log(cc);
			if(!cc) return;

			message.contentPreserved = message.content.substring(cmdCheck.length, message.content.length).trim();
			msg = message.contentPreserved.toLowerCase();
			message.content = msg;

			try {
				var tag = await Oxyl.modScripts.tagModule.getTag(cc, message);
				Oxyl.modScripts.tagModule.addUse(tag.TYPE, tag.NAME, message);
				var tagresult = await Oxyl.modScripts.tagModule.executeTag(tag.CONTENT, message);
				if(guild && guild.id === "254768930223161344") console.log(tagresult);
			} catch(err) {
				console.log("error!", err.stack || err);
				return;
			}

			command = {
				name: cmdCheck,
				onCooldown: () => false,
				run: async msg2 => tagresult,
				type: "custom",
				description: "Custom Command",
				cooldowns: {},
				usage: "[]",
				args: []
			};
		} else {
			return;
			// if(!type.match(/<@!?255832257519026178>/)) return;
			// message.channel.sendTyping();
			// let clever = await framework.cleverResponse(msg);
			// console.log(`CleverBot in ${guild ? guild.name : "DM"} by ${framework.unmention(message.author)}: ${message.content}`);
			// message.channel.createMessage(clever).catch(err => err);
			// return;
		}
	// } else if(guild && cleverchannels.indexOf(message.channel.id) !== -1) {
	// 	message.channel.sendTyping();
	// 	let clever = await framework.cleverResponse(msg);
	// 	console.log(`CleverBot in ${guild.name} by ${framework.unmention(message.author)}: ${message.content}`);
	// 	message.channel.createMessage(clever).catch(err => err);
	// 	return;
	} else {
		return;
	}

	if(command.onCooldown(message.author)) {
		message.channel.createMessage(`This command is on cooldown for you.`);
		return;
	} else if((command.guildOnly || command.perm) && !guild) {
		message.channel.createMessage(`This command can only be use in guilds (servers).`);
		return;
	} else if(command.type === "creator" && !framework.config.creators.includes(message.author.id)) {
		message.channel.createMessage(`Only creators of Oxyl can use this command.`);
		return;
	} else if(command.type === "admin" && framework.guildLevel(message.member) < 3) {
		message.channel.createMessage(`Only the guld owner, or users with the ADMINISTRATOR permission can use this command.`);
		return;
	} else if(command.type === "music" && musicchannels[guild.id] && musicchannels[guild.id].id !== message.channel.id) {
		message.channel.createMessage("You cannot use music commands in this channel.");
		return;
	} else if(command.perm && !message.member.permission.has(command.perm)) {
		message.channel.createMessage(`You do not have valid permissions for this command (Requires ${command.perm}).`);
		return;
	}

	let arguments = message.contentPreserved.split(" ", command.args.length);
	let spaceCount = message.contentPreserved.match(/ /g);
	if(spaceCount && arguments && arguments.length <= spaceCount.length) {
		let i = framework.nthIndex(message.contentPreserved, " ", arguments.length);
		arguments[arguments.length - 1] += message.contentPreserved.substring(i);
	}
	message.argsUnparsed = arguments;
	message.argsPreserved = [];

	try {
		var validated = await validateArgs(message, command);

		message = validated;
		message.args = message.argsPreserved.map(ele => {
			if(typeof ele === "string") return ele.toLowerCase();
			else return ele;
		});
	} catch(err) {
		message.channel.createMessage(err.message);
		return;
	}

	try {
		console.log(`${command.name} in ${guild ? guild.name : "DM"} by ${framework.unmention(message.author)}: ${message.contentPreserved || "no args"}`);
		if(guild && guild.id === "254768930223161344") console.log(command);
		var result = await command.run(message);
		if(guild && guild.id === "254768930223161344") console.log(result);

		msg = { content: "" };
		let file;

		if(Array.isArray(result)) {
			msg.content = result[0];
			file = result[1];
		} else if(typeof result === "object") {
			msg = result;
		} else if(result) {
			msg.content = result;
		} else {
			msg = false;
		}

		if(msg) {
			if(msg.content) msg.content = msg.content.substring(0, 2000);
			try {
				var resultmsg = await message.channel.createMessage(msg, file || null);
			} catch(err) {
				message.channel.createMessage("Error sending message");
			}
		}
	} catch(error) {
		framework.consoleLog(`Failed command ${command.name} (${command.type})\n` +
				`**Error:** ${framework.codeBlock(error.stack || error)}`, "debug");
		message.channel.createMessage("Bot error when executing command, error sent to Support Server");
	}
});

async function checkArg(input, arg, message, cmd) {
	if(!input && arg.optional) {
		return input;
	} else if(!input && arg.type !== "custom") {
		throw new Error(`Incorrect usage! Correct usage: ${cmd.name} ${cmd.usage}`);
	} else {
		return await Oxyl.modScripts.commandArgs.test(input, arg, message);
	}
}

async function validateArgs(message, command, index = 0) {
	if(index >= command.args.length) return message;
	try {
		var newArg = await checkArg(message.argsUnparsed[index], command.args[index], message, command);
		message.argsPreserved[index] = newArg;
		return await validateArgs(message, command, index + 1);
	} catch(err) {
		throw err;
	}
}
