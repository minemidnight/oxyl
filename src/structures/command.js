class Command {
	constructor(data) {
		if(data.disabled) return;
		if(!data.name) throw new Error("Command has no name");
		else if(!data.process) throw new Error(`Command ${data.name} must have code`);
		else if(!data.description) console.warn(`Command ${data.name} has no description`);

		this.name = data.name;
		this.process = data.process;
		this.aliases = data.aliases || [];
		this.description = data.description;
		this.caseSensitive = !!data.caseSensitive;
		this.args = data.args || [];
		this.guildOnly = !!data.guildOnly;
		this.perm = data.perm;
		this.type = data.type;
		this.uses = 0;

		if(this.args.length === 0) {
			this.usage = "[]";
		} else {
			let usage = [];
			for(let arg of this.args) {
				arg.label = arg.label || arg.type;

				if(arg.optional) usage.push(`[${arg.label}]`);
				else usage.push(`<${arg.label}>`);
			}
			this.usage = usage.join(" ");
		}

		bot.commands.push(this);
	}

	run(message) {
		this.uses++;
		return this.process(message);
	}

	toString() {
		return this.name;
	}
}

module.exports = Command;
