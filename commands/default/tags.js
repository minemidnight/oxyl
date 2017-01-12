const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	math = require("mathjs");

let tableOrder = ["GlobalTags", "GuildTags", "ChannelTags", "UserTags", "UnlistedTags"];
function getTag(query, message, table = 0) {
	let tableName = tableOrder[table], dbQuery;

	return new Promise((resolve, reject) => {
		if(tableName === "GlobalTags") {
			dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`NAME\` = '${query}'`;
		} else if(tableName === "GuildTags" || tableName === "ChannelTags") {
			let id = tableName === "GuildTags" ? message.guild.id : message.channel.id;
			dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`NAME\` = '${query}' AND \`ID\` = '${id}'`;
		} else if(tableName === "UserTags") {
			dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`NAME\` = '${query}' AND \`CREATOR\` = '${message.author.id}'`;
		} else if(tableName === "UnlistedTags") {
			dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`NAME\` = '${query}'`;
		}

		framework.dbQuery(dbQuery).then(data => {
			if(data && data[0]) {
				data[0].TYPE = tableName.substring(0, tableName.indexOf("Tags")).toLowerCase();
				resolve(data[0]);
			} else if(table < tableOrder.length - 1) {
				getTag(query, message, table + 1)
				.then(resolve)
				.catch(reject);
			} else {
				reject("NO_RESULTS");
			}
		});
	});
}

function addUse(type, name, message) {
	type = tableOrder.find(table => table.toLowerCase().startsWith(type));
	if(type === "GlobalTags") {
		framework.dbQuery(`UPDATE \`${type}\` SET \`USES\` = \`USES\` + 1 WHERE \`NAME\` = '${name}'`);
	} else if(type === "GuildTags" || type === "ChannelTags") {
		let id = type === "GuildTags" ? message.guild.id : message.channel.id;
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
		`VALUES ('${data.creator}','${data.name}','${data.createdAt}', '${data.content}')`);
	} else if(type === "GuildTags" || type === "ChannelTags") {
		framework.dbQuery(`INSERT INTO \`${type}\`(\`CREATOR\`, \`ID\`, \`NAME\`, \`CREATED_AT\`, \`CONTENT\`)` +
		`VALUES ('${data.creator}','${data.id}','${data.name}','${data.createdAt}','${data.content}')`);
	} else {
		framework.dbQuery(`INSERT INTO \`${type}\`(\`CREATOR\`, \`NAME\`, \`CREATED_AT\`, \`CONTENT\`)` +
		`VALUES ('${data.creator}','${data.name}','${data.createdAt}','${data.content}')`);
	}
}

function deleteTag(type, name, message) {
	type = tableOrder.find(table => table.toLowerCase().startsWith(type));
	if(type === "GlobalTags") {
		framework.dbQuery(`DELETE FROM \`${type}\` WHERE \`NAME\` = '${name}'`);
	} else if(type === "GuildTags" || type === "ChannelTags") {
		let id = type === "GuildTags" ? message.guild.id : message.channel.id;
		framework.dbQuery(`DELETE FROM \`${type}\` WHERE \`NAME\` = '${name}' AND \`ID\` = '${id}'`);
	} else if(type === "UserTags") {
		framework.dbQuery(`DELETE FROM \`${type}\` WHERE \`NAME\` = '${name}' AND \`CREATOR\` = '${message.author.id}'`);
	} else if(type === "UnlistedTags") {
		framework.dbQuery(`DELETE FROM \`${type}\` WHERE \`NAME\` = '${name}'`);
	}
}

function getUnlistedTags() {
	return framework.dbQuery(`SELECT * FROM \`UnlistedTags\``);
}

function getTags(message, fullData, table = 0) {
	let tableName = tableOrder[table], dbQuery;
	if(!fullData) {
		fullData = {
			global: [],
			guild: [],
			channel: [],
			user: []
		};
	}

	return new Promise((resolve, reject) => {
		if(tableName === "GlobalTags") {
			dbQuery = `SELECT * FROM \`${tableName}\``;
		} else if(tableName === "GuildTags" || tableName === "ChannelTags") {
			let id = tableName === "GuildTags" ? message.guild.id : message.channel.id;
			dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`ID\` = '${id}'`;
		} else if(tableName === "UserTags") {
			dbQuery = `SELECT * FROM \`${tableName}\` WHERE \`CREATOR\` = '${message.author.id}'`;
		} else {
			resolve(fullData);
			return;
		}

		framework.dbQuery(dbQuery).then(data => {
			if(data && data.length >= 1) {
				let type = tableName.substring(0, tableName.indexOf("Tags")).toLowerCase();
				data.forEach(dataType => {
					dataType.TYPE = type;
				});

				fullData[type] = data;
			}

			if(table < tableOrder.length - 1) {
				getTags(message, fullData, table + 1)
				.then(resolve);
			} else {
				resolve(fullData);
			}
		});
	});
}

function parseTag(tag, message) {
	tag = tag.CONTENT || tag;
	if(message.args[0].startsWith("test")) {
		message.argsPreserved = [];
	} else {
		message.argsPreserved = message.argsPreserved[0].split(" ").splice(1);
		message.argsPreserved = message.argsPreserved.map(ele => ele.replace(/}/g, "&rb;").replace(/{/g, "&lb;"));
	}
	message.tagVars = {};
	return new Promise((resolve, reject) => {
		let results = [];
		while(tag.match(/{[^{}]+}/)) {
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

			if(results.length >= 1) argArray = results;
			try {
				let newArg = tagParser[argType.toLowerCase()](argArray, message);
				if(typeof newArg === "object" && newArg.tagVars) {
					message = newArg; newArg = "";
				} else if(typeof newArg === "object") {
					results.push(newArg);
				} else {
					results = [];
				}

				tag = tag.replace(originalArg, newArg);
			} catch(err) {
				reject(`Error parsing tag at \`${originalArg}\``);
				return;
			}
		}

		tag = tag.replace(/@everyone/g, "@\u200Beveryone")
		.replace(/@here/g, "@\u200Bhere")
		.replace(/&lb;/g, "{")
		.replace(/&rb;/g, "}");
		resolve(tag);
	});
}
exports.parseTag = parseTag;

var command = new Command("tag", (message, bot) => {
	let msg = message.argsPreserved[0];
	let guild = message.guild, channel = message.channel, user = message.author;
	if(msg.toLowerCase() === "list") {
		getTags(message).then(tagTypes => {
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

			message.channel.createMessage(tagMsg);
		});
	} else if(msg.toLowerCase().startsWith("listu")) {
		getUnlistedTags().then(tags => {
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

			message.channel.createMessage(tagMsg);
		});
	} else if(msg.toLowerCase().startsWith("delete")) {
		let name = msg.split(" ", 2)[1], deletable;
		let level = framework.guildLevel(message.member);
		if(!name) {
			channel.createMessage("Please provide the name of the tag you'd like to delete, `tag delete [name]`");
			return;
		}
		name = name.toLowerCase();

		getTag(name, message).then(tag => {
			if(level >= 4) {
				deletable = true;
			} else if(tag.TYPE === "guild" && level >= 3) {
				deletable = true;
			} else if(tag.TYPE === "guild" && level >= 2 && tag.CREATOR === user.id) {
				deletable = true;
			} else if(tag.TYPE === "channel" && level >= 2) {
				deletable = true;
			} else if(tag.TYPE === "channel" && level >= 1 && tag.CREATOR === user.id) {
				deletable = true;
			} else if(tag.CREATOR === user.id) {
				deletable = true;
			}

			if(!deletable) {
				channel.createMessage("You can't delete that tag (not enough perms, and not the tag creator)");
			} else {
				deleteTag(tag.TYPE, name, message);
				channel.createMessage("Tag deleted");
			}
		}).catch(() => {
			channel.createMessage("That tag does not exist");
		});
	} else if(msg.toLowerCase().startsWith("create")) {
		let name = msg.split(" ", 2)[1], type;
		let level = framework.guildLevel(message.member);
		if(!name) {
			channel.createMessage("Your tag needs a name, `tag create [name] [content] [type (default user)]`");
			return;
		}
		name = name.toLowerCase();

		getTag(name, message).then(tag => {
			channel.createMessage("That tag already exists. Please delete it, then try again");
		}).catch(() => {
			let createData = {
				creator: user.id,
				createdAt: Date.now(),
				name: name
			};

			if(msg.toLowerCase().endsWith("-global")) {
				createData.type = "global";

				if(level < 4) {
					channel.createMessage("You do not have enough permissions to create a global tag");
					return;
				}
			} else if(msg.toLowerCase().endsWith("-guild") || msg.toLowerCase().endsWith("-server")) {
				createData.type = "guild";
				createData.id = guild.id;

				if(level < 2) {
					channel.createMessage("You do not have enough permissions to create a guild tag");
					return;
				}
			} else if(msg.toLowerCase().endsWith("-channel")) {
				createData.type = "channel";
				createData.id = channel.id;

				if(level < 1) {
					channel.createMessage("You do not have enough permissions to create a channel tag");
					return;
				}
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
			if(!content || content.length === 0) {
				channel.createMessage("Tag must have content");
				return;
			}

			createData.content = content;
			createTag(createData);
			channel.createMessage(`Tag \`${name}\` created (type: \`${createData.type}\`)`);
		});
	} else if(msg.toLowerCase().startsWith("test")) {
		if(!message.content) {
			channel.createMessage("You must provide tag content");
			return;
		}

		parseTag(msg.substring(4).trim(), message).then(parsed => {
			channel.createMessage(parsed)
			.catch(() => channel.createMessage("Error sending tag -- no content or too long?"));
		}).catch(reason => {
			if(!reason) channel.createMessage("Tag failed, no fail reason");
			else channel.createMessage(reason);
		});
	} else if(msg.toLowerCase().startsWith("raw")) {
		let name = msg.split(" ", 2)[1];
		if(!name) {
			channel.createMessage("Please provide the name of the tag you'd like to see, `tag raw [name]`");
			return;
		}
		name = name.toLowerCase();

		getTag(name, message).then(tag => {
			channel.createMessage(framework.codeBlock(tag.CONTENT));
		}).catch(() => {
			channel.createMessage("No tag found");
		});
	} else if(msg.toLowerCase().startsWith("info")) {
		let name = msg.split(" ", 2)[1];
		if(!name) {
			channel.createMessage("Please provide the name of the tag you'd like to see, `tag raw [name]`");
			return;
		}
		name = name.toLowerCase();

		getTag(name, message).then(tag => {
			let data = [
				`Creator: ${framework.unmention(bot.users.get(tag.CREATOR))}`,
				`Created At: ${framework.formatDate(parseInt(tag.CREATED_AT))}`,
				`Type: ${framework.capitalizeEveryFirst(tag.TYPE)}`,
				`Uses: ${tag.USES}`
			];

			channel.createMessage(`Tag **${name}**: ${framework.listConstructor(data)}`);
		}).catch(() => {
			channel.createMessage("No tag found");
		});
	} else {
		let name = msg.split(" ", 1)[0];
		if(!name) {
			channel.createMessage("Please provide the name of the tag you'd like to see, `tag raw [name]`");
			return;
		}
		name = name.toLowerCase();

		getTag(name, message).then(tag => {
			parseTag(tag, message).then(parsed => {
				addUse(tag.TYPE, tag.NAME, message);
				channel.createMessage(parsed)
				.catch(() => channel.createMessage("Error sending tag -- no content or too long?"));
			}).catch(channel.createMessage);
		}).catch(() => {
			channel.createMessage("No tag found");
		});
	}
}, {
	guildOnly: true,
	cooldown: 5000,
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
		return: "ID of roles a member has",
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
		usage: "<String> <Regex> <String> [String]"
	},
	repeat: {
		return: "Repeats a phrase as many times as you'd like (do not forget the character limit)",
		in: "hi|3",
		out: `"hihihi"`,
		usage: "<Input> <Number>"
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
		usage: "<String> <Regex> <Group <Number>> [Flags <String>]"
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
		in: "@%{tvar:uname}",
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
	}
};

module.exports.info = tagInfo;
module.exports.sorted = Object.keys(tagInfo).sort();

const tagParser = {
	abs: args => Math.abs(parseFloat(args[0])),
	allargs: (args, message) => message.argsPreserved.length >= 0 ? message.argsPreserved.join(" ") : null,
	arg: (args, message) => {
		if(!message.argsPreserved.length >= 0) return null;
		let argsCombined = "";
		args.forEach(ele => { argsCombined += message.argsPreserved[ele]; });
		return argsCombined;
	},
	argcount: (args, message) => message.argsPreserved.length,
	author: (args, message) => message.author,
	avatar: args => args[0].user ? args[0].user.avatarURL : args[0].avatarURL,
	capitalize: args => args[0].toString().toUpperCase(),
	ceil: args => Math.ceil(parseFloat(args[0])),
	channel: (args, message) => message.channel,
	charAt: args => args[0].toString().charAt(args[1]),
	choose: args => args[Math.floor(Math.random() * args.length)],
	createdat: args => framework.formatDate(args[0].createdAt),
	discriminator: args => args[0].user ? args[0].user.discriminator : args[0].discriminator,
	floor: args => Math.floor(parseFloat(args[0])),
	game: args => args[0].game ? args[0].game.name : "None",
	getmember: (args, message) => message.guild.members.get(args[0]),
	getuser: (args, message) => message.guild.members.get(args[0]).user,
	guild: (args, message) => message.guild,
	icon: args => args[0].iconURL,
	id: args => args[0].id,
	if: args => {
		if(args.length < 4) return new Error;
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
			return new Error;
		}

		if(result) {
			return args[3];
		} else {
			return args[4] || "";
		}
	},
	int: args => Math.floor(Math.random() * (parseInt(args[1]) - parseInt(args[0]))) + parseInt(args[0]),
	isnan: args => isNaN(args[0]),
	length: args => args[0].length,
	lower: args => args[0].toString().toLowerCase(),
	math: args => math.eval(args[0]),
	member: (args, message) => message.member,
	memberjoinedat: (args, message) => framework.formatDate(args[0].joinedAt),
	membercount: (args, message) => message.guild.memberCount,
	mention: args => args[0].mention,
	name: args => args[0].name,
	nickname: args => args[0].nick || args[0].user.username,
	nl: args => "\n",
	now: args => framework.formatDate(new Date()),
	num: args => (Math.random() * (parseFloat(args[1]) - parseFloat(args[0]))) + parseFloat(args[0]),
	parsefloat: args => parseFloat(args[0]),
	parseint: args => parseInt(args[0]),
	regex: args => new RegExp(args[1], args[3] || "").exec(args[0])[args[2]],
	repeat: args => args[0].repeat(parseInt(args[1])),
	replace: args => args[0].replace(args[1], args[2]),
	replaceall: args => args[0].replace(new RegExp(framework.escapeRegex(args[1])), args[2]),
	replaceregex: args => args[0].replace(new RegExp(args[1], args[3] || ""), args[2]),
	roles: args => args[0].roles,
	round: args => Math.round(parseFloat(args[0])),
	status: args => args[0].status,
	substring: args => args[0].toString().substring(args[1], args[2]),
	tvar: (args, message) => {
		if(args[1]) {
			message.tagVars[args[0]] = args[1];
			return message;
		} else {
			return message.tagVars[args[0]];
		}
	},
	unmention: args => framework.unmention(args[0]),
	user: (args, message) => message.author,
	username: (args, message) => args[0].user ? args[0].user.username : args[0].username
};
