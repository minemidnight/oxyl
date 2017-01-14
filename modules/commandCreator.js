const Oxyl = require("../oxyl.js");
const bot = Oxyl.bot;

class Command {
	constructor(name, callback, options) {
		if(!name) throw new Error("Command must have a name");
		if(!callback) throw new Error("Command must have a callback");
		if(!options.description) console.warn(`!! Command ${name} has no description`);
		if(!options.type) console.warn(`!! Command ${name} has no type (using default)`);

		this.name = name;
		this.process = callback;

		this.aliases = options.aliases || [];
		this.type = options.type || "default";
		this.description = options.description || undefined;
		this.args = options.args || [];
		this.enabled = !!options.defaultEnabled || true;
		this.guildOnly = !!options.guildOnly || false;
		this.cooldown = options.cooldown || 0;
		this.perm = options.perm || null;
		this.uses = 0;
		this.cooldowns = {};

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

		Oxyl.addCommand(this);
	}

	run(message) {
		this.addUse(message.author);
		return this.process(message, bot);
	}

	addUse(user) {
		this.uses++;
		if(this.cooldown > 0) {
			this.cooldowns[user.id] = true;
			setTimeout(() => delete this.cooldowns[user.id], this.cooldown);
		}
	}

	onCooldown(user) {
		return this.cooldowns[user.id];
	}

	toString() {
		return this.name;
	}
}

module.exports = Command;
