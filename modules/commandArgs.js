const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const config = framework.config,
	bot = Oxyl.bot;

exports.test = (input, arg, message) => {
	let type = arg.type;
	return new Promise((resolve, reject) => {
		if(type === "text" || type === "custom") {
			resolve(input);
		} else if(type === "int") {
			input = parseInt(input);
			if(isNaN(input)) {
				reject("Argument provided is not a number");
			} else if(arg.min && input < arg.min) {
				reject(`Argument provided is less than minimum amount (${arg.min})`);
			} else if(arg.max && input > arg.max) {
				reject(`Argument provided is more than maximum amount (${arg.max})`);
			} else {
				resolve(input);
			}
		}	else if(type === "float") {
			input = parseFloat(input);
			if(isNaN(input)) {
				reject("Argument provided is not a number");
			} else if(arg.min && input < arg.min) {
				reject(`Argument provided is less than minimum amount (${arg.min})`);
			} else if(arg.max && input > arg.max) {
				reject(`Argument provided is more than maximum amount (${arg.max})`);
			} else {
				resolve(input);
			}
		} else if(type === "link") {
			let filter = config.options.linkFilter;
			filter = new RegExp(filter);
			if(!filter.test(input)) {
				reject("Invalid link");
			} else {
				resolve(input);
			}
		} else if(type === "mention" || type === "user") {
			let match = /<@!?(\d{14,20})>/.exec(input);
			if(match && match[1]) {
				let user = bot.users.get(match[1]);
				if(user) {
					resolve(user);
				} else {
					bot.fetchUser(user).then(fetchedUser => {
						if(!fetchedUser) {
							reject("User from mention not found");
						} else {
							resolve(fetchedUser);
						}
					});
				}
			} else {
				let members = bot.users, usersFound;
				if(message.guild)	members = message.guild.members;

				usersFound = members.filter(member => {
					if(member.user) member = member.user;

					if(member.username.toLowerCase() === input.toLowerCase()) return true;
					return false;
				});

				if(!usersFound || usersFound.length === 0) {
					usersFound = members.filter(member => {
						if(member.user) member = member.user;

						if(member.id === input) {
							return true;
						} else if(member.username.substring(0, input.length).toLowerCase() === input.toLowerCase()) {
							return true;
						} else {
							return false;
						}
					});
				}

				let i = 0;
				usersFound.forEach(user => {
					if(user.user) {
						usersFound[i] = user.user;
					} else {
						usersFound[i] = user;
					}
					i++;
				});

				if(!usersFound || usersFound.length === 0) {
					reject("No mention or user found");
				} else if(usersFound.length === 1) {
					resolve(usersFound[0]);
				} else {
					let map = usersFound.slice(0, 15).map(user => `[${usersFound.indexOf(user) + 1}] ${framework.unmention(user)}`).join("\n");
					if(usersFound.length > 15) map += `\n... and ${usersFound.length - 15} more`;
					let selectUser = message.channel.createMessage(`Multiple users found. Please say a number ` +
						`below to choose one in the next 10 seconds: ${framework.codeBlock(map, "ini")}`);

					framework.awaitMessages(message.channel, newMsg => {
						if(newMsg.author.id === message.author.id) {
							return true;
						} else {
							return false;
						}
					}, { maxMatches: 1, time: 10000 }).then(responses => {
						if(!responses || responses.size === 0 || !responses[0]) {
							reject("No user given");
						} else {
							let int = parseInt(responses[0].content);
							if(isNaN(int) || int > 15 || int < 1 || int > usersFound.length) {
								reject("Invalid user number");
							} else {
								resolve(usersFound[int - 1]);
							}
						}
					});
				}
			}
		} else {
			reject("Invalid validation type -- report to bot creators");
		}
	});
};
