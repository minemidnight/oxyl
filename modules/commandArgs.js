const config = framework.config;

function matchUser(user, input) {
	let username = user.user ? user.user.username.toLowerCase() : user.username.toLowerCase();
	let nick = user.nick || null;
	input = input.toLowerCase();

	if(input.includes("#")) {
		let index = input.lastIndexOf("#");
		var discrim = parseInt(input.substring(index + 1));
		input = input.substring(0, index);
		if(isNaN(discrim)) discrim = false;
		else if(user.user ? user.user.discriminator : user.discriminator === discrim) discrim = true;
	}

	if(user.id === input) return 3;
	else if(nick && nick === input && discrim) return 3;
	else if(username === input && discrim) return 3;
	else if(nick && nick === input) return 2;
	else if(username === input) return 2;
	else if(username.startsWith(input)) return 1;
	else if(nick && nick.startsWith(input)) return 1;
	else return 0;
}

function getUsers(input, users) {
	let matches = {
		1: [],
		2: [],
		3: []
	};

	users.forEach(member => {
		let matchLevel = matchUser(member, input);
		if(matchLevel > 0) matches[matchLevel].push(member.user || member);
	});

	if(matches[3].length >= 1) return matches[3];
	else if(matches[2].length >= 1) return matches[2];
	else if(matches[1].length >= 1) return matches[1];
	else return undefined;
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
			let usersFound = message.channel.guild ? getUsers(input, message.channel.guild.members) || getUsers(input, bot.users) : getUsers(input, bot.users);
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
