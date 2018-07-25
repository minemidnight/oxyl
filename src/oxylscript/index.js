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
	async execute(match, eventVariables) {
		const sem = semantics(match);
		sem.data = {
			eventVariables,
			variables: {}
		};

		await sem.run();
	}
};
