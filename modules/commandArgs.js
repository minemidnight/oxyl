const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js");
const config = framework.config,
	bot = Oxyl.bot;

exports.test = (input, arg) => {
	let type = arg.type;
	return new Promise((resolve, reject) => {
		if(type === "text" || type === "custom") {
			resolve(input);
		} else if(type === "custom") {
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
			let match = input.match(/<@!?([0-9]+)>/g);
			if(match || match[1]) {
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
				bot.users.filter(user => {
					if(user.username.toLowerCase() === input.toLowerCase()) {
						return true;
					} else if(user.id === input) {
						return true;
					} else if(user.username.substring(0, input.length).toLowerCase === input.toLowerCase) {
						return true;
					} else {
						return false;
					}
				});

				if(!bot.users || bot.users.size <= 0) {
					reject("No mentions found or users with that username");
				} else if(bot.users.size === 1) {
					resolve(bot.users.first());
				} else {
					reject("Multiple users found, please mention them, type their full name, or give a user id");
				}
			}
		} else {
			reject("Invalid validation type -- report to bot creators");
		}
	});
};
