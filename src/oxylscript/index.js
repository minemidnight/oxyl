const fs = require("fs");
const ohm = require("ohm-js");
const path = require("path");

const checker = require("./ast/checker");
const grammar = ohm.grammar(fs.readFileSync(path.resolve(__dirname, "syntax.ohm")));
const operations = fs.readdirSync(path.resolve(__dirname, "syntax"));

const semantics = grammar.createSemantics()
	.addOperation("run", operations.reduce((actions, file) => {
		const ext = path.extname(file);
		if(ext !== ".js") return actions;

		const action = require(path.resolve(__dirname, "syntax", file));
		actions[path.basename(file, ext)] = action;
		return actions;
	}, {}));

module.exports = {
	grammar,
	match(string) {
		return grammar.match(string);
	},
	check(match) {
		return checker(match);
	},
	async execute(match, message) {
		const sem = semantics(match);
		sem.data = {
			variables: {},
			author: message.author,
			message: message,
			channel: message.channel,
			guild: message.channel.guild
		};

		await sem.run();
	}
};
