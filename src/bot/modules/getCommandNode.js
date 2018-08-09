module.exports = (command, { categories }) => {
	let category = command.category;
	if(!category) category = categories.find(cat => cat.subcommands.has(command.name)).name;
	else if(!categories.has(category)) category = categories.find(cat => cat.subcommands.has(category)).name;
	command = command.name;

	let node = `${category}.`;

	if(!categories.get(category).commands.has(command)) {
		const subcommands = categories.get(category).subcommands;
		if(!subcommands) return false;
		if(!subcommands.has(command)) {
			const subcommand = subcommands.find(({ commands }) => commands.has(command));
			if(!subcommand) return false;
			else node += `${subcommand.name}.`;
		}
	}

	node += command;
	return node;
};
