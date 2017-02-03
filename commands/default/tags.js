const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	math = require("mathjs");

let tableOrder = ["GlobalTags", "GuildTags", "ChannelTags", "UserTags", "UnlistedTags"];
async function getTag(query, message, table = 0) {
	let tableName = tableOrder[table], dbQuery;

	if(tableName === "GlobalTags") {
		dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`NAME\` = '${query}'`;
	} else if(tableName === "GuildTags" || tableName === "ChannelTags") {
		let id = tableName === "GuildTags" ? message.channel.guild.id : message.channel.id;
		dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`NAME\` = '${query}' AND \`ID\` = '${id}'`;
	} else if(tableName === "UserTags") {
		dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`NAME\` = '${query}' AND \`CREATOR\` = '${message.author.id}'`;
	} else if(tableName === "UnlistedTags") {
		dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`NAME\` = '${query}'`;
	}

	let data = await framework.dbQuery(dbQuery);
	if(data && data[0]) {
		data[0].TYPE = tableName.substring(0, tableName.indexOf("Tags")).toLowerCase();
		return data[0];
	} else if(table < tableOrder.length - 1) {
		return await getTag(query, message, table + 1);
	} else {
		throw new Error("NO_RESULTS");
	}
}

function addUse(type, name, message) {
	type = tableOrder.find(table => table.toLowerCase().startsWith(type));
	if(type === "GlobalTags") {
		framework.dbQuery(`UPDATE \`${type}\` SET \`USES\` = \`USES\` + 1 WHERE \`NAME\` = '${name}'`);
	} else if(type === "GuildTags" || type === "ChannelTags") {
		let id = type === "GuildTags" ? message.channel.guild.id : message.channel.id;
		framework.dbQuery(`UPDATE \`${type}\` SET \`USES\` = \`USES\` + 1 WHERE \`NAME\` = '${name}' AND \`ID\` = '${id}'`);
	} else if(type === "UserTags") {
		framework.dbQuery(`UPDATE \`${type}\` SET \`USES\` = \`USES\` + 1 WHERE \`NAME\` = '${name}' AND \`CREATOR\` = '${message.author.id}'`);
	} else if(type === "UnlistedTags") {
		framework.dbQuery(`UPDATE \`${type}\` SET \`USES\` = \`USES\` + 1 WHERE \`NAME\` = '${name}'`);
	}
}

function createTag(data) {
	let type = data.type;
	type = tableOrder.find(table => table.toLowerCase().startsWith(type));
	if(type === "GlobalTags") {
		framework.dbQuery(`INSERT INTO \`${type}\`(\`CREATOR\`, \`NAME\`, \`CREATED_AT\`, \`CONTENT\`)` +
		`VALUES ('${data.creator}',${framework.sqlEscape(data.name)},'${data.createdAt}', ${framework.sqlEscape(data.content)})`);
	} else if(type === "GuildTags" || type === "ChannelTags") {
		framework.dbQuery(`INSERT INTO \`${type}\`(\`CREATOR\`, \`ID\`, \`NAME\`, \`CREATED_AT\`, \`CONTENT\`)` +
		`VALUES ('${data.creator}','${data.id}',${framework.sqlEscape(data.name)},'${data.createdAt}',${framework.sqlEscape(data.content)})`);
	} else {
		framework.dbQuery(`INSERT INTO \`${type}\`(\`CREATOR\`, \`NAME\`, \`CREATED_AT\`, \`CONTENT\`)` +
		`VALUES ('${data.creator}',${framework.sqlEscape(data.name)},'${data.createdAt}',${framework.sqlEscape(data.content)})`);
	}
}

function deleteTag(type, name, message) {
	type = tableOrder.find(table => table.toLowerCase().startsWith(type));
	if(type === "GlobalTags") {
		framework.dbQuery(`DELETE FROM \`${type}\` WHERE \`NAME\` = ${framework.sqlEscape(name)}`);
	} else if(type === "GuildTags" || type === "ChannelTags") {
		let id = type === "GuildTags" ? message.channel.guild.id : message.channel.id;
		framework.dbQuery(`DELETE FROM \`${type}\` WHERE \`NAME\` = ${framework.sqlEscape(name)} AND \`ID\` = '${id}'`);
	} else if(type === "UserTags") {
		framework.dbQuery(`DELETE FROM \`${type}\` WHERE \`NAME\` = ${framework.sqlEscape(name)} AND \`CREATOR\` = '${message.author.id}'`);
	} else if(type === "UnlistedTags") {
		framework.dbQuery(`DELETE FROM \`${type}\` WHERE \`NAME\` = ${framework.sqlEscape(name)}`);
	}
}

async function getUnlistedTags() {
	return await framework.dbQuery(`SELECT * FROM \`UnlistedTags\``);
}

async function getTags(message, fullData, table = 0) {
	let tableName = tableOrder[table], dbQuery;
	if(!fullData) {
		fullData = {
			global: [],
			guild: [],
			channel: [],
			user: []
		};
	}

	if(tableName === "GlobalTags") {
		dbQuery = `SELECT * FROM \`${tableName}\``;
	} else if(tableName === "GuildTags" || tableName === "ChannelTags") {
		let id = tableName === "GuildTags" ? message.channel.guild.id : message.channel.id;
		dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`ID\` = '${id}'`;
	} else if(tableName === "UserTags") {
		dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`CREATOR\` = '${message.author.id}'`;
	} else {
		return fullData;
	}

	let data = await framework.dbQuery(dbQuery);
	if(data && data.length >= 1) {
		let type = tableName.substring(0, tableName.indexOf("Tags")).toLowerCase();
		data.forEach(dataType => {
			dataType.TYPE = type;
		});

		fullData[type] = data;
	}

	if(table < tableOrder.length - 1) {
		return await getTags(message, fullData, table + 1);
	} else {
		return fullData;
	}
}

async function parseTag(tag, message) {
	tag = tag.CONTENT || tag;
	if(message.argsPreserved[0].toLowerCase().startsWith("test")) {
		message.argsPreserved = [];
	} else {
		message.argsPreserved = message.argsPreserved[0].split(" ").splice(1);
		message.argsPreserved = message.argsPreserved.map(ele => ele.replace(/}/g, "&rb;").replace(/{/g, "&lb;"));
	}
	message.tagVars = {};

	let results = [], executions = 0;
	while(tag.match(/{[^{}]+}/)) {
		if(executions >= 1000) throw new Error("Prevented recursion, 1000 tag executions hit");
		executions++;

		let originalArg = tag.match(/{[^{}]+}/)[0];
		let arg = originalArg;
		let argArray = [], argType;
		arg = arg.substring(1, arg.length - 1);
		if(arg.endsWith(":") && !arg.includes("|")) {
			argType = arg.substring(0, arg.length - 1);
		} else if(arg.includes(":")) {
			argType = arg.substring(0, arg.indexOf(":"));
			arg = arg.substring(arg.indexOf(":") + 1);
			argArray = arg.includes("|") ? argArray.concat(arg.split("|")) : argArray = [arg];
		} else {
			argType = arg;
		}

		if(results.length >= argArray.length && results.length >= 1) argArray = results;
		else if(results.length >= 1) argArray = results.concat(argArray.splice(results.length));
		try {
			let newArg = await tagParser[argType.toLowerCase()](argArray, message);
			// detect if it's modifying the message
			if(newArg && typeof newArg === "object" && newArg.argsPreserved) {
				message = newArg;
				newArg = "";
			} else if(typeof newArg === "object" || typeof newArg === "undefined") {
				results = [newArg];
			} else {
				results = [];
			}

			tag = tag.replace(originalArg, newArg);
		} catch(err) {
			if(message.tagVars.fallback) return message.tagVars.fallback;
			else throw new Error(`Parsing at \`${originalArg}\`\nMore Info: ${framework.codeBlock(err.stack || err)}`);
		}
	}

	tag = tag.replace(/@everyone/g, "@\u200Beveryone")
		.replace(/@here/g, "@\u200Bhere")
		.replace(/&lb;/g, "{")
		.replace(/&rb;/g, "}");

	if(!tag || tag.length <= 0) throw new Error(`Tag has no content`);
	else if(tag.length >= 2000) throw new Error(`Tag is over 2000 characters`);
	else return tag;
}
exports.parseTag = parseTag;

var command = new Command("tag", async (message, bot) => {
	let msg = message.argsPreserved[0];
	let guild = message.channel.guild, channel = message.channel, user = message.author;
	if(msg.toLowerCase() === "list") {
		let tagTypes = await getTags(message);
		let tagMsg = "";
		for(let type in tagTypes) {
			let tagNames = [];
			for(let i in tagTypes[type]) {
				tagNames.push(tagTypes[type][i].NAME);
			}
			tagNames.sort();

			tagMsg += `${framework.capitalizeEveryFirst(type)} Tags **(${tagNames.length})**: `;
			tagMsg += `\`${tagNames.length >= 1 ? tagNames.join("`**,** `") : "None"}\`\n`;
		}

		tagMsg += "\nThis excludes other users, other channel and other server tags.\n" +
								"To view unlisted tags, use `tag listu`.";

		return tagMsg;
	} else if(msg.toLowerCase().startsWith("listu")) {
		let tags = await getUnlistedTags();
		let maxPages = Math.ceil(tags.length / 100);
		let page = parseInt(msg.substring(5).trim()) || 1;
		if(page > maxPages) page = maxPages;

		let tagMsg = `Found ${tags.length} total unlisted tags.\nPage ${page} of ${maxPages}:`;

		if(tags.length > 0) {
			let tagNames = [];
			for(let i = 0; i < 100; i++) {
				let index = ((page - 1) * 100) + i;
				tagNames.push(tags[index].NAME);
				if(tags.length - 1 === index || i === 99) break;
			}
			tagMsg += `${framework.codeBlock(tagNames.join(","))}`;
		} else {
			tagMsg = "No unlisted tags";
		}

		return tagMsg;
	} else if(msg.toLowerCase().startsWith("delete")) {
		let name = msg.split(" ", 2)[1], deletable, tag;
		let level = framework.guildLevel(message.member);
		if(!name) return "Please provide the name of the tag you'd like to delete, `tag delete [name]`";
		name = name.toLowerCase();

		try {
			tag = await getTag(name, message);
		} catch(err) {
			return "That tag does not exist";
		}

		if(level >= 4) deletable = true;
		else if(tag.TYPE === "guild" && level >= 3) deletable = true;
		else if(tag.TYPE === "guild" && level >= 2 && tag.CREATOR === user.id) deletable = true;
		else if(tag.TYPE === "channel" && level >= 2) deletable = true;
		else if(tag.TYPE === "channel" && level >= 1 && tag.CREATOR === user.id) deletable = true;
		else if(tag.CREATOR === user.id) deletable = true;

		if(!deletable) {
			return "You can't delete that tag (not enough perms, and not the tag creator)";
		} else {
			deleteTag(tag.TYPE, name, message);
			return "Tag deleted";
		}
	} else if(msg.toLowerCase().startsWith("create")) {
		let name = msg.split(" ", 2)[1], type, exists = true, tag;
		let level = framework.guildLevel(message.member);
		if(!name) return "Your tag needs a name, `tag create [name] [content] [type (default user)]`";
		name = name.toLowerCase();

		try {
			tag = await getTag(name, message);
		} catch(err) {
			exists = false;
		}

		if(exists) return "That tag already exists. Please delete it, then try again";

		let createData = {
			creator: user.id,
			createdAt: Date.now(),
			name: name
		};

		if(msg.toLowerCase().endsWith("-global")) {
			createData.type = "global";

			if(level < 4) return "You do not have enough permissions to create a global tag, try an unlisted.";
		} else if(msg.toLowerCase().endsWith("-guild") || msg.toLowerCase().endsWith("-server")) {
			createData.type = "guild";
			createData.id = guild.id;

			if(level < 2) return "You do not have enough permissions to create a guild tag";
		} else if(msg.toLowerCase().endsWith("-channel")) {
			createData.type = "channel";
			createData.id = channel.id;

			if(level < 1) return "You do not have enough permissions to create a channel tag";
		} else if(msg.toLowerCase().endsWith("-unlisted")) {
			createData.type = "unlisted";
		} else {
			createData.type = "user";
		}

		let content;
		if(createData.type === "user" && !msg.endsWith("-user")) {
			content = msg.substring(7 + name.length);
		} else {
			content = msg.substring(7 + name.length, msg.lastIndexOf("-"));
		}
		content = content.trim();
		if(!content || content.length === 0) return "Tag must have content";

		createData.content = content;
		createTag(createData);
		return `Tag \`${name}\` created (type: \`${createData.type}\`)`;
	} else if(msg.toLowerCase().startsWith("test")) {
		if(!msg.substring(4).trim() || msg.substring(4).trim() === "") return "You must provide tag content to test";

		let parsed;
		try {
			parsed = await parseTag(msg.substring(4).trim(), message);
		} catch(err) {
			if(!err) return "Tag failed, no fail reason";
			else return err.toString();
		}

		return parsed;
	} else if(msg.toLowerCase().startsWith("raw")) {
		let name = msg.split(" ", 2)[1], tag;
		if(!name) return "Please provide the name of the tag you'd like to see, `tag raw [name]`";
		name = name.toLowerCase();

		try {
			tag = await getTag(name, message);
		} catch(err) {
			return "No tag found";
		}

		return framework.codeBlock(tag.CONTENT);
	} else if(msg.toLowerCase().startsWith("info")) {
		let name = msg.split(" ", 2)[1], tag;
		if(!name) return "Please provide the name of the tag you'd like to see, `tag info [name]`";
		name = name.toLowerCase();

		try {
			tag = await getTag(name, message);
		} catch(err) {
			return "No tag found";
		}

		let data = [
			`Creator: ${framework.unmention(bot.users.get(tag.CREATOR))}`,
			`Created At: ${framework.formatDate(parseInt(tag.CREATED_AT))}`,
			`Type: ${framework.capitalizeEveryFirst(tag.TYPE)}`,
			`Uses: ${tag.USES}`
		];

		return `Tag **${name}**: ${framework.listConstructor(data)}`;
	} else {
		let name = msg.split(" ", 1)[0], tag, parsed;
		if(!name) return "Please provide the name of the tag you'd like to see, `tag [name]`";
		name = name.toLowerCase();

		try {
			tag = await getTag(name, message);
		} catch(err) {
			return "No tag found";
		}

		try {
			parsed = await parseTag(tag, message);
		} catch(err) {
			if(!err) return "Tag failed, no fail reason";
			else return err.toString();
		}

		addUse(tag.TYPE, tag.NAME, message);
		return parsed;
	}
}, {
	guildOnly: true,
	cooldown: 2500,
	type: "default",
	aliases: ["t", "tags"],
	description: "Create, delete, display, test or list tags (view http://minemidnight.work/tags)",
	args: [{
		type: "text",
		label: "<tag name>|test <content>|create <name> <content>|delete <name>|list|raw <name>|info <name>"
	}]
});

const tagInfo = {
	choose: {
		return: "Random choice out of the choices given",
		in: "cake|pie",
		out: `"pie"`,
		usage: "<Strings...>"
	},
	arg: {
		return: "Argument number requested",
		in: "@%{math:{arg:0}/{arg:1}",
		out: "2",
		usage: "<Numbers...>"
	},
	allargs: {
		return: "All arguments combined",
		in: "@%You said: {allargs}",
		out: `"You said: testing args"`
	},
	channel: {
		return: "Current Channel",
		out: "{ Object Channel }"
	},
	id: {
		return: "ID of channel/guild/user",
		in: "{author}",
		out: `"254768930223161344"`,
		usage: "<Channel/Guild/User Object>"
	},
	name: {
		return: "Name of channel/guild",
		in: "{guild}",
		out: `"Oxyl Support"`,
		usage: "<Channel/Guild Object>"
	},
	guild: {
		return: "Current Guild (server)",
		out: "{ Object Guild }"
	},
	membercount: {
		return: "Amount of members in a guild",
		in: "{guild}",
		out: "34",
		usage: "<Guild Object>"
	},
	abs: {
		return: "Absolute value of a number",
		in: "-5",
		out: "5",
		usage: "<Number>"
	},
	floor: {
		return: "Rounded down number",
		in: "3.7421",
		out: "3",
		usage: "<Number>"
	},
	round: {
		return: "Rounded number",
		in: "3.5",
		out: "4",
		usage: "<Number>"
	},
	createdAt: {
		return: "When a channel/guild/user was created",
		in: "{guild}",
		out: `"Sunday, November 01 2015, 08:46:38"`,
		usage: "<Channel/Guild/User Object>"
	},
	author: {
		return: "User who sent the message",
		out: "{ Object User }"
	},
	user: {
		return: "Alias for author -- user who sent message / user from event",
		out: "{ Object User }"
	},
	member: {
		return: "Guild member who sent the message (can get nickname from this, but not user)",
		out: "{ Object Member }"
	},
	roles: {
		return: "Array of ID of roles a member has",
		out: `["110375768374136832"]`,
		usage: "<Member>"
	},
	length: {
		return: "Length of string",
		in: "hello",
		out: "5",
		usage: "<String>"
	},
	capitalize: {
		return: "A string capitalized",
		in: "Hello World!",
		out: `"HELLO WORLD!"`,
		usage: "<String>"
	},
	lower: {
		return: "A string converted to lowercase",
		in: "Today is Decemeber 26th",
		out: `"today is decemember 26th"`,
		usage: "<String>"
	},
	int: {
		return: "Random integer (whole number) between two numbers",
		in: "3|9",
		out: "6",
		usage: "<Number> <Number>"
	},
	num: {
		return: "Randon number (not whole) between two numbers",
		in: "2|6",
		out: "3.64",
		usage: "<Number> <Number>"
	},
	replace: {
		return: "Replace the first instance of a text with another text",
		in: "hello world|world|earth",
		out: `"hello earth"`,
		usage: "<String> <String> <String>"
	},
	replaceall: {
		return: "Replace all instances of a text with another text",
		in: "world hello world|world|earth",
		out: `"earth hello earth"`,
		usage: "<String> <String> <String>"
	},
	replaceregex: {
		return: "Replace all instances of a text in a string using regex",
		in: "Hello wolrd!|wo[rl]{2}d|earth|g",
		out: `"Hello earth!"`,
		usage: "<String> <Regex> <String> [Flags <String>]"
	},
	repeat: {
		return: "Repeats a phrase as many times as you'd like (do not forget the character limit)",
		in: "hi|3",
		out: `"hihihi"`,
		usage: "<String> <Number>"
	},
	substring: {
		return: "Gets a part of a phrase",
		in: "test|1|3",
		out: `"es"`,
		usage: "<String>"
	},
	now: {
		return: "Current Time",
		out: `"Monday, Decemeber 26 2016, 23:03:53"`
	},
	avatar: {
		return: "User's avatar URL",
		in: "{author}",
		out: `"https://cdn.discordapp.com/avatars/..."`,
		usage: "<Member/User Object>"
	},
	getuser: {
		return: "User from ID (Only searches current guild)",
		in: "155112606661607425",
		out: "{ Object User }",
		usage: "<Member/User ID>"
	},
	getmember: {
		return: "Member from ID (Only searches current guild)",
		in: "155112606661607425",
		out: "{ Object Member }",
		usage: "<Member/User ID>"
	},
	memberjoinedat: {
		return: "When a member joined the current guild",
		in: "{member}",
		out: `"Sunday, Decemeber 11 2016, 17:49:30"`,
		usage: "<Member Object>"
	},
	discriminator: {
		return: "A user's discriminator",
		in: "{author}",
		out: `"1537"`,
		usage: "<Member/User Object>"
	},
	status: {
		return: "A user's status",
		in: "{member}",
		out: `"online"`,
		usage: "<Member Object>"
	},
	username: {
		return: "A user's username",
		in: "{author}",
		out: `"minemidnight"`,
		usage: "<Member/User Object>"
	},
	mention: {
		return: "Mention of a channel or user",
		in: "{channel}",
		out: `"#general"`,
		usage: "<Channel/User Object>"
	},
	nickname: {
		return: "Nickname of a member",
		in: "{member}",
		out: `"mememidnight"`,
		usage: "<Member Object>"
	},
	game: {
		return: "Game of a member",
		in: "{member}",
		out: `"Rocket League"`,
		usage: "<Member Object>"
	},
	if: {
		return: "Use conditionals to execute code (<=, <, >, >=, !=, =, includes, startswith, endswith)",
		in: "{game:{member}}|!==|None|Playing {game:{member}}|Not playing a game",
		out: `"Not playing a game"`,
		usage: "<Argument> <Conditional> <Argument> <Then> [Else]"
	},
	regex: {
		return: "Specified match of regex execution",
		in: "aaab|a+|0|gi",
		out: `"aaa"`,
		usage: "<String> <Regex> <Group> <Number> [Flags <String>]"
	},
	isnan: {
		return: "If something is a not a number",
		in: "4.3",
		out: `"false"`,
		usage: "<Argument>"
	},
	icon: {
		return: "Icon of a guild",
		in: "{guild}",
		out: `"https://cdn.discordapp.com/icons/..."`,
		usage: "<Guild Object>"
	},
	parseint: {
		return: "String parsed as integer",
		in: "@%{parseInt:5} {parseInt:5.25} {parseInt:abc}",
		out: "5 NaN NaN",
		usage: "<String>"
	},
	parsefloat: {
		return: "String parsed as a float (number with decimals)",
		in: "@%{parseFloat:5} {parseFloat:5.25} {parseFloat:abc}",
		out: "5.00 5.25 NaN",
		usage: "<String>"
	},
	charat: {
		return: "Character at a certain place",
		in: "hello|0",
		out: `"h"`,
		usage: "<String> <Number>"
	},
	math: {
		return: "Evaluate a math expression",
		in: "5*9",
		out: "45",
		usage: "<Expression>"
	},
	ceil: {
		return: "Number rounded up",
		in: "3.1",
		out: "4",
		usage: "<Number>"
	},
	tvar: {
		return: "A temporary variable (must be set before using)",
		in: "@%{tvar:uname|{username:{author}}} {tvar:uname}",
		out: `"minemidnight"`,
		usage: "<String> [New Value (Anything)]"
	},
	nl: {
		return: "New line (\\n)",
		in: "@%Hello!{nl}You are {username:{member}}",
		out: `"Hello\nYou are minemidnight"`
	},
	argcount: {
		return: "Amount of args",
		out: "2"
	},
	unmention: {
		return: "Username#Discriminator",
		in: "{author}",
		out: `"minemidnight#1537"`,
		usage: "<Member/User Object>"
	},
	split: {
		return: "Array of text split at a character",
		in: "lolabc|a",
		out: `["lol","bc"]`,
		usage: "<String> [String]"
	},
	map: {
		return: "New array with results based on argument (&this; is the looped element)",
		in: "{split:abc|b}|:regional_indicator_&this;:",
		out: `[":regional_indicator_a:",":regional_indicator_c:"]`,
		usage: "<Array> <New Value>"
	},
	join: {
		return: "Array joined by a character",
		in: "{split:abc|b}|d",
		out: `"adc"`,
		usage: "<Array> [String]"
	},
	isset: {
		return: "If something is set",
		in: "{args:0}",
		out: `"true"`,
		usage: "<Anything>"
	},
	settype: {
		return: "Parses an argument as a specific type to use later, accepted types are text, int, float or mention/user",
		in: "0|user",
		out: `"" (nothing)`,
		usage: "<Integer> <String <ArgType>>"
	},
	fallback: {
		return: "Sets fallback text if the tag fails, instead of the default",
		in: "This tag failed! :(",
		out: `"" (nothing)`,
		usage: "<String>"
	}
};

module.exports.info = tagInfo;
module.exports.sorted = Object.keys(tagInfo).sort();

const tagParser = {
	abs: async args => Math.abs(parseFloat(args[0])),
	allargs: async (args, message) => message.argsPreserved.length >= 0 ? message.argsPreserved.join(" ") : null,
	arg: async (args, message) => message.argsPreserved[parseInt(args[0])],
	argcount: async (args, message) => message.argsPreserved.length,
	author: async (args, message) => message.author,
	avatar: async args => args[0].user ? args[0].user.avatarURL : args[0].avatarURL,
	capitalize: async args => args[0].toString().toUpperCase(),
	ceil: async args => Math.ceil(parseFloat(args[0])),
	channel: async (args, message) => message.channel,
	charAt: async args => args[0].toString().charAt(args[1]),
	choose: async args => args[Math.floor(Math.random() * args.length)],
	createdat: async args => framework.formatDate(args[0].createdAt),
	discriminator: async args => args[0].user ? args[0].user.discriminator : args[0].discriminator,
	fallback: async (args, message) => {
		message.tagVars.fallback = args[0];
		return message;
	},
	floor: async args => Math.floor(parseFloat(args[0])),
	game: async args => args[0].game ? args[0].game.name : "None",
	getmember: async (args, message) => message.channel.guild.members.get(args[0]),
	getuser: async (args, message) => message.channel.guild.members.get(args[0]).user,
	guild: async (args, message) => message.channel.guild,
	icon: async args => args[0].iconURL,
	id: async args => args[0].id,
	if: async args => {
		if(args.length < 4) throw new Error;
		let result;
		if(args[1] === "<=") {
			result = args[0] <= args[2];
		} else if(args[1] === ">=") {
			result = args[0] >= args[2];
		} else if(args[1] === "=" || args[1] === "==" || args[1] === "===") {
			result = args[0] === args[2];
		} else if(args[1] === "!=" || args[1] === "=/=" || args[1] === "!==") {
			result = args[0] !== args[2];
		} else if(args[1] === "startswith") {
			result = args[0].startWith(args[2]);
		} else if(args[1] === "endswith") {
			result = args[0].endsWith(args[2]);
		} else if(args[1] === "includes" || args[1] === "contains") {
			result = args[0].includes(args[2]);
		} else if(args[1] === "<") {
			result = args[0] < args[2];
		} else if(args[1] === ">") {
			result = args[0] > args[2];
		} else {
			throw new Error();
		}

		if(result) {
			return args[3];
		} else {
			return args[4] || "";
		}
	},
	int: async args => Math.floor(Math.random() * (parseInt(args[1]) - parseInt(args[0]))) + parseInt(args[0]),
	isnan: async args => isNaN(args[0]),
	isset: async args => args[0] ? "true" : "false",
	join: async args => args[0].join(args[1]),
	length: async args => args[0].length,
	lower: async args => args[0].toString().toLowerCase(),
	map: async args => args[0].map(ele => args[1].replace(/&this;/g, ele.toString())),
	math: async args => math.eval(args[0]),
	member: async (args, message) => message.member,
	memberjoinedat: async (args, message) => framework.formatDate(args[0].joinedAt),
	membercount: async (args, message) => message.channel.guild.memberCount,
	mention: async args => args[0].mention,
	name: async args => args[0].name,
	nickname: async args => args[0].nick || args[0].user.username,
	nl: async args => "\n",
	now: async args => framework.formatDate(new Date()),
	num: async args => (Math.random() * (parseFloat(args[1]) - parseFloat(args[0]))) + parseFloat(args[0]),
	parsefloat: async args => parseFloat(args[0]),
	parseint: async args => parseInt(args[0]),
	regex: async args => {
		let match = new RegExp(args[1], args[3] || "").exec(args[0]);
		if(match) return match[args[2]];
		else return undefined;
	},
	repeat: async args => args[0].repeat(parseInt(args[1])),
	replace: async args => args[0].replace(args[1], args[2]),
	replaceall: async args => args[0].replace(new RegExp(framework.escapeRegex(args[1]), "g"), args[2]),
	replaceregex: async args => args[0].replace(new RegExp(args[1], args[3] || ""), args[2]),
	roles: async args => args[0].roles,
	round: async args => Math.round(parseFloat(args[0])),
	settype: async (args, message) => {
		const validator = Oxyl.modScripts.commandArgs;
		let index = parseInt(args[0]);
		let newArg = await validator.test(message.argsPreserved[index], { type: args[1] }, message);
		message.argsPreserved[index] = newArg;
		return message;
	},
	split: async args => args[0].split(args[1] || ""),
	status: async args => args[0].status,
	substring: async args => args[0].toString().substring(args[1], args[2]),
	tvar: async (args, message) => {
		if(args[1]) {
			message.tagVars[args[0]] = args[1];
			return message;
		} else {
			return message.tagVars[args[0]];
		}
	},
	unmention: async args => framework.unmention(args[0]),
	user: async (args, message) => message.author,
	username: async (args, message) => args[0].user ? args[0].user.username : args[0].username
};
