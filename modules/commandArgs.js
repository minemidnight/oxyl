const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const config = framework.config,
	bot = Oxyl.bot;

function matchUser(user, input) {
	let username = user.user.username.toLowerCase() || user.username.toLowerCase();
	let nick = user.nick || null;
	input = input.toLowerCase();

	if(input.includes("#")) {
		let index = input.lastIndexOf("#");
		let discrim = parseInt(input.substring(index) + 1);
		input = input.substring(0, index - 1);
		if(isNaN(discrim)) discrim = null;
		else if(user.discriminator !== discrim) return 0;
	}

	if(user.id === input) return 2;
	else if(nick && nick === input) return 2;
	else if(username === input) return 2;
	else if(username.startsWith(input)) return 1;
	else if(nick && nick.startsWith(input)) return 1;
	else return 0;
}

exports.test = async (input, arg, message) => {
	let type = arg.type;
	if(!input || input.length === 0) return new Error("No input given");
	if(type === "text" || type === "custom") {
		return input;
	} else if(type === "int" || type === "float") {
		input = type === "int" ? parseInt(input) : parseFloat(input);
		if(isNaN(input)) throw new Error("Argument provided is not a number");
		else if(arg.min && input < arg.min) throw new Error(`Argument provided is less than minimum amount (${arg.min})`);
		else if(arg.max && input > arg.max) throw new Error(`Argument provided is more than maximum amount (${arg.max})`);
		else return input;
	} else if(type === "link") {
		let filter = config.options.linkFilter;
		filter = new RegExp(filter);
		if(!filter.test(input)) throw new Error("Invalid link");
		else return input;
	} else if(type === "mention" || type === "user") {
		let match = /<@!?(\d{14,20})>/.exec(input);
		if(match && match[1]) {
			let user = bot.users.get(match[1]);
			if(user) return user;
			else throw new Error("User from mention not cached :(");
		} else {
			let members = bot.users;
			if(message.channel.guild)	members = message.channel.guild.members;

			let hardFound = null;
			let usersFound = members.filter(member => {
				if(hardFound) return false;
				let matchLevel = matchUser(member, input);

				if(matchLevel === 2) hardFound = member.user || member;
				else if(matchLevel === 1) return true;
				else return false;
				return true;
			});

			usersFound.map(user => {
				if(user.user) return user.user;
				else return user;
			});

			if(hardFound) return hardFound;
			if(!usersFound || usersFound.length === 0) {
				throw new Error("No mention or user found");
			} else if(usersFound.length === 1) {
				return usersFound[0];
			} else {
				let map = usersFound.slice(0, 15).map(user => `[${usersFound.indexOf(user) + 1}] ${framework.unmention(user)}`).join("\n");
				if(usersFound.length > 15) map += `\n... and ${usersFound.length - 15} more`;
				let selectUser = await message.channel.createMessage(`Multiple users found. Please say a number ` +
						`below to choose one in the next 10 seconds: ${framework.codeBlock(map, "ini")}`);

				let responses = await framework.awaitMessages(message.channel, newMsg => {
					if(newMsg.author.id === message.author.id) {
						return true;
					} else {
						return false;
					}
				}, { maxMatches: 1, time: 10000 });

				if(!responses || responses.size === 0 || !responses[0]) {
					throw new Error("No user given");
				} else {
					let int = parseInt(responses[0].content);
					if(isNaN(int) || int > 15 || int < 1 || int > usersFound.length) throw new Error("Invalid user number");
					else return usersFound[int - 1];
				}
			}
		}
	} else {
		throw new Error("Invalid argument type");
	}
};
