const resolver = bot.utils.resolver;
module.exports = async (message) => {
	let command = message.command;
	message.content = message.content.trim();
	if(command.args.length <= 1) return [message.content];

	let args = [], currentQuoted = false, startIndex = 0;
	for(let i = 0; i < message.content.length; i++) {
		let char = message.content.charAt(i);
		if(char === `"`) {
			if(currentQuoted === false) {
				startIndex = i + 1;
			} else {
				args.push(message.content.substring(startIndex, i));
				if(command.args.length === args.length - 1) {
					args.push(message.content.substring(i + 2).trim());
					break;
				}
				startIndex = 0;
			}
			currentQuoted = !currentQuoted;
		} else if(char === " " && !currentQuoted && !startIndex) {
			args.push(message.content.substring(startIndex, i));
			if(command.args.length === args.length - 1) {
				args.push(message.content.substring(i + 1).trim());
				break;
			}
			startIndex = i;
		}
	}

	if(args.length !== command.args.filter(arg => !arg.optional).length) {
		return `Invalid Usage! Please use the command as such: \`${command.name} ${command.usage}\``;
	}

	try {
		args = args.map((arg, i) => resolver[command.args[i].type](message, arg, command.args[i]));
		return args;
	} catch(err) {
		return err.message;
	}
};
