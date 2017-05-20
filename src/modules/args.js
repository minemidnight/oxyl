const resolver = bot.utils.resolver;
module.exports = async (message) => {
	let command = message.command;
	message.content = message.content.trim();
	if(command.args.length === 0) return [message.content.trim()];

	let args = [], currentQuoted = false, startIndex = 0;
	for(let i = 0; i < message.content.length; i++) {
		if(command.args.length === 1) {
			if((message.content.startsWith(`"`) && message.content.endsWith(`"`)) ||
				(message.content.startsWith("'") && message.content.endsWith("'")) ||
				(message.content.startsWith("`") && message.content.endsWith("`")))	{
				args = [message.content.substring(1, message.content.length - 1).trim()];
			} else {
				args = [message.content.trim()];
			}
			break;
		}

		let char = message.content.charAt(i);
		if(char === `"` || char === "'" || char === "`") {
			if(currentQuoted === false) {
				startIndex = i + 1;
			} else {
				args.push(message.content.substring(startIndex, i));

				if(command.args.length - 1 === args.length) {
					args.push(message.content.substring(i + 1).trim());
					break;
				}
				startIndex = 0;
			}
			currentQuoted = !currentQuoted;
		} else if(char === " " && !currentQuoted) {
			if((startIndex === 0 && args.length === 0) || startIndex !== 0) {
				args.push(message.content.substring(startIndex, i));

				if(command.args.length - 1 === args.length) {
					args.push(message.content.substring(i + 1).trim());
					startIndex = 0;
					break;
				}
			}
			startIndex = i + 1;
		}
	}
	if((startIndex !== 0 && args.length < command.args.length) ||
		(startIndex === 0 && args.length === 0 && message.content.length !== 0)) {
		args.push(message.content.substring(startIndex));
	}

	if(args.length < command.args.filter(arg => !arg.optional).length) {
		return __("modules.args.usageError", message, { command: command.name, usage: command.usage });
	}

	try {
		args = await Promise.all(args.map((arg, i) => resolver[command.args[i].type](message, arg, command.args[i])));
		return args;
	} catch(err) {
		return err.message;
	}
};
