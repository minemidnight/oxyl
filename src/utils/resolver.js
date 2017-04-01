const linkFilter = /^((https|http|ftp|rtsp|mms)?:\/\/)?(([0-9a-z_!~*'().&=+$%-]+:)?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)$/im; // eslint-disable-line max-len
function matchUser(user, input) {
	let username = user.user ? user.user.username.toLowerCase() : user.username.toLowerCase();
	let nick = user.nick ? user.nick.toLowerCase() : null;
	input = input.toLowerCase();

	if(input.includes("#")) {
		let index = input.lastIndexOf("#");
		var discrim = parseInt(input.substring(index + 1));
		input = input.substring(0, index);
		if(isNaN(discrim)) discrim = false;
		else if((user.user ? user.user.discriminator : user.discriminator) === discrim) discrim = true;
		else return 0;
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


module.exports = {
	text: (message, input) => message.content,
	num: (message, input, options) => {
		if(!input.match(/\d+/)) throw new Error("Argument provided is not a number");
		else input = parseInt(input);
		if(options.min && input < options.min) {
			throw new Error(`Argument provided is less than minimum amount (${options.min})`);
		} else if(options.max && input > options.max) {
			throw new Error(`Argument provided is more than maximum amount (${options.max})`);
		} else {
			return input;
		}
	},
	user: async (message, input) => {
		let match = /<@!?(\d{14,20})>/.exec(input);
		if(match && match[1]) {
			let user = bot.users.get(match[1]);
			if(user) return user;
			else throw new Error("User from mention not cached");
		} else {
			let usersFound = message.channel.guild ?
				getUsers(input, message.channel.guild.members) || getUsers(input, bot.users) :
				getUsers(input, bot.users);
			if(!usersFound || usersFound.length === 0) {
				throw new Error("No mention or user found");
			} else if(usersFound.length === 1) {
				return usersFound[0];
			} else {
				let map = usersFound.slice(0, 15)
					.map((user, i) => `[${i + 1}] ${user.username}#${user.discriminator}`).join("\n");
				if(usersFound.length > 15) map += `\n... and ${usersFound.length - 15} more`;
				let selectUser = await message.channel.createMessage(`Multiple users found. Please say a number ` +
						`below to choose one in the next 10 seconds: ${bot.utils.codeBlock(map, "ini")}`);

				let responses = await bot.utils.awaitMessages(message.channel,
					newMsg => newMsg.author.id === message.author.id, { maxMatches: 1, time: 10000 });

				if(responses.size === 0) {
					throw new Error("No user given");
				} else {
					let int = parseInt(responses[0].content);
					await selectUser.delete();
					if(isNaN(int) || int > 15 || int < 1 || int > usersFound.length) throw new Error("Invalid user number");
					else return usersFound[int - 1];
				}
			}
		}
	},
	link: (message, input) => {
		if(!linkFilter.test(input)) throw new Error("Invalid link");
		else return input;
	}
};
