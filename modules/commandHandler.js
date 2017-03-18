const commands = Oxyl.commands;
const prefixes = exports.prefixes = {};
const blacklist = exports.blacklist = [];
const ignored = exports.ignored = [];
// wait for connection
exports.updateThings = async () => {
	let prefixArray = await Oxyl.modScripts.sqlQueries.dbQuery(`SELECT * FROM Settings WHERE NAME = "prefix"`);
	prefixArray.forEach(data => {
		prefixes[data.ID] = data.VALUE;
	});

	let blacklistedUsers = await Oxyl.modScripts.sqlQueries.dbQuery(`SELECT * FROM Blacklist`);
	blacklistedUsers.forEach(data => blacklist.push(data.USER));

	let ignoredChannels = await Oxyl.modScripts.sqlQueries.dbQuery(`SELECT CHANNEL FROM Ignored`);
	ignoredChannels.forEach(data => ignored.push(data.CHANNEL));
};

bot.on("messageCreate", async (message) => {
	Oxyl.statsd.increment(`oxyl.messages`);
	Oxyl.siteScripts.website.messageCreate(message);
	let guild = message.channel.guild;
	let msg = message.content.toLowerCase();
	if(message.author.bot || blacklist.includes(message.author.id)) return;
	else if(ignored.includes(message.channel.id) && message.member && framework.guildLevel(message.member) < 3) return;

	let prefix = `^(o!|oxyl|<@!?${bot.user.id}>|<:oxyl_square:273616293775540224>|<:oxyl:273616986121043968>{GPRE}),?(?:\\s+)?([\\s\\S]+)`;
	if(guild && prefixes[guild.id]) prefix = prefix.replace("{GPRE}", `|${framework.escapeRegex(prefixes[guild.id])}`);
	else prefix = prefix.replace("{GPRE}", "");
	prefix = new RegExp(prefix, "i");

	let match = message.content.match(prefix);
	if(match && match[2]) {
		let type = match[1];
		if(type.match(new RegExp(`^<@!?${bot.user.id}>`))) message.debug = true;
		message.content = match[2];

		let cmdInfo = framework.getCmd(message.content);
		var command = cmdInfo.cmd;
		if(command) {
			message.contentPreserved = cmdInfo.newContent;
			msg = message.contentPreserved.toLowerCase();
			message.content = msg;
			if(message.channel.guild) var editedinfo = await Oxyl.modScripts.sqlQueries.editCommands.info(command.name, message.channel.guild);
		} else if(guild) {
			msg = message.content.toLowerCase();
			let cmdCheck;
			if(msg.indexOf(" ") === -1) cmdCheck = msg;
			else cmdCheck = msg.substring(0, msg.indexOf(" "));

			let cc = await Oxyl.modScripts.sqlQueries.customCommands.get(message.channel.guild.id, cmdCheck);
			if(!cc) return;

			message.contentPreserved = message.content.substring(cmdCheck.length, message.content.length).trim();
			msg = message.contentPreserved.toLowerCase();
			message.content = msg;

			try {
				var tag = await Oxyl.modScripts.tagModule.getTag(cc, message);
			} catch(err) {
				return;
			}

			command = {
				name: cmdCheck,
				onCooldown: () => false,
				run: async msg2 => {
					message.tagOwner = tag.CREATOR;
					Oxyl.modScripts.tagModule.addUse(tag.TYPE, tag.NAME, msg2);
					return await Oxyl.modScripts.tagModule.executeTag(tag.CONTENT, msg2);
				},
				type: "custom",
				description: "Custom Command",
				cooldowns: {},
				args: [{ type: "text", optional: "true" }]
			};
		} else {
			return;
		}
	} else {
		return;
	}

	if(editedinfo && editedinfo.ENABLED === 0) return;
<<<<<<< HEAD
	if(editedinfo && editedinfo.ROLES) editedinfo.ROLES = editedinfo.ROLES.filter(role => guild.roles.has(role));
=======
	if(editedinfo && editedinfo.ROLES) editedinfo.ROLES = editedinfo.ROLES.split(",").filter(role => message.channel.guild.roles.has(role));
>>>>>>> origin/master
	if(command.onCooldown(message.author)) {
		message.channel.createMessage(`This command is on cooldown for you.`);
		return;
	} else if((command.guildOnly || command.perm) && !guild) {
		message.channel.createMessage(`This command can only be use in guilds (servers).`);
		return;
	} else if(command.type === "creator" && !framework.config.creators.includes(message.author.id)) {
		message.channel.createMessage(`Only creators of Oxyl can use this command.`);
		return;
	} else if(command.type === "admin" && (!editedinfo || !editedinfo.ROLES) && framework.guildLevel(message.member) < 3) {
		message.channel.createMessage(`Only the guild owner, or users with the ADMINISTRATOR permission can use this command.`);
		return;
	} else if(command.perm && (!editedinfo || !editedinfo.ROLES) && !message.member.permission.has(command.perm)) {
		message.channel.createMessage(`You do not have valid permissions for this command (Requires ${command.perm}).`);
		return;
	} else if(editedinfo && editedinfo.ROLES && editedinfo.ROLES.every(role => ~message.member.roles.indexOf(role))) {
		message.channel.createMessage(`You do not have all of the roles to run this command ` +
			`(Requires the following: ${editedinfo.ROLES.map(role => message.channel.guild.roles.get(role).name)}).`);
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
		framework.consoleLog(`${command.name} in ${guild ? guild.name : "DM"} by ${framework.unmention(message.author)}: ` +
			`${message.contentPreserved || "no args"}`, "commands");
		var result = await command.run(message);

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
		if(!error) return;
		Oxyl.statsd.increment(`oxyl.errors`);
		try {
			let resp = JSON.parse(error.response);
			if(resp.code === 50013 || resp.code === 10008 || resp.code === 50001 || resp.code === 40005 || resp.code === 10003) {
				message.channel.createMessage("Command failed due to a permissions error");
			} else {
				throw error;
			}
		} catch(err) {
			message.channel.createMessage(`Error executing this command! ` +
				`Please report this if it is re-occuring: ${framework.codeBlock(message.debug ? err.stack : err.message)}`);
		}
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
