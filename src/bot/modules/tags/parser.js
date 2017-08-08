const TagError = require(`${__dirname}/tagError`);
const fs = require("fs");
const conditions = fs.readdirSync(`${__dirname}/conditions`);
const effects = fs.readdirSync(`${__dirname}/effects`);
const expressions = fs.readdirSync(`${__dirname}/expressions`);
const ifStatements = fs.readdirSync(`${__dirname}/ifStatements`);
const loops = fs.readdirSync(`${__dirname}/loops`);
const types = fs.readdirSync(`${__dirname}/types`);
const variables = fs.readdirSync(`${__dirname}/variables`);

function replacedNestedBrackets(string) {
	const indexes = [];
	for(let i = 0; i < string.length; i++) {
		let char = string.charAt(i);
		if(char === "[") {
			indexes.push(i + 1);
		} else if(char === "]") {
			let pop = indexes.pop();
			if(i - pop === 1) {
				string = `${string.substring(0, pop - 1)}(${string.substring(pop, i)})?${string.substring(i + 1)}`;
			} else if(string.charAt(pop - 2) === " ") {
				string = `${string.substring(0, pop - 2)}( ${string.substring(pop, i)})?${string.substring(i + 1)}`;
			} else if(string.charAt(i + 1) === " ") {
				string = `${string.substring(0, pop - 1)}(${string.substring(pop, i)} )?${string.substring(i + 2)}`;
			} else if(string.charAt(pop - 2) === " " && string.charAt(i + 1) === " ") {
				string = `${string.substring(0, pop - 2)}( ${string.substring(pop, i)} )?${string.substring(i + 2)}`;
			} else {
				string = `${string.substring(0, pop - 1)}(${string.substring(pop, i)})?${string.substring(i + 1)}`;
			}
		}
	}

	return string.replace(/\((.+?)\)/g, "(?:$1)");
}
let syntaxes = [];
syntaxes.push({ name: "End Keyword", patterns: ["end"] });

ifStatements.forEach(ifStatement => {
	let file = require(`${__dirname}/ifStatements/${ifStatement}`);
	file.patterns = file.patterns.map(pattern => `${pattern}:`);
	syntaxes.push(file);
});

loops.forEach(loop => {
	let file = require(`${__dirname}/loops/${loop}`);
	file.patterns = file.patterns.map(pattern => `${replacedNestedBrackets(pattern)}:`);
	syntaxes.push(file);
});

effects.forEach(eff => {
	let file = require(`${__dirname}/effects/${eff}`);
	file.patterns = file.patterns.map(replacedNestedBrackets);
	syntaxes.push(file);
});

expressions.forEach(expr => {
	let file = require(`${__dirname}/expressions/${expr}`);
	file.patterns = file.patterns.map(replacedNestedBrackets);
	syntaxes.push(file);
});

variables.forEach(variable => {
	let file = require(`${__dirname}/variables/${variable}`);
	syntaxes.push(file);
});

conditions.forEach(cond => {
	let file = require(`${__dirname}/conditions/${cond}`);
	file.patterns = file.patterns.map(replacedNestedBrackets);
	file.returns = "boolean";
	syntaxes.push(file);
});

types.forEach(type => {
	let file = require(`${__dirname}/types/${type}`);
	file.isType = true;
	if(file.patterns) syntaxes.push(file);
});

function findSyntax(string, invalidPatterns = [], allowedPatterns) {
	let toSearch = syntaxes, patternFound;
	if(allowedPatterns) toSearch = toSearch.filter(syn => ~allowedPatterns.indexOf(syn.name));
	let syntax = toSearch.find(syn => {
		patternFound = syn.patterns
			.find((pattern, i) => {
				if(invalidPatterns.find(invalid => invalid.name === syn.name && invalid.index === i)) return false;
				let newPattern = pattern.replace(/%.+?%/g, "(.+?)");
				if(newPattern.endsWith("(.+?)")) newPattern = `${newPattern.substring(0, newPattern.length - 5)}(.+)`;
				newPattern = new RegExp(`^${newPattern}$`, "i");
				return newPattern.test(string);
			});

		return !!patternFound;
	});
	return syntax ? { code: string, pattern: patternFound, syntax } : undefined;
}

module.exports = async (options, string) => {
	string = string.replace(/  +/g, " ");

	let linesParsed = string.split("\n").map(line => {
		line = line.trim();
		if(line.startsWith("#")) return false;
		else if(line.endsWith(";")) line = line.substring(0, line.length - 1).trim();

		let found = findSyntax(line, [], ["If", "Else if", "Else", "Loop list", "Loop nth times", "End Keyword"]);
		return found || line;
	}).filter(line => line);

	let codeBlocks = [], spliceIndex = 0;
	for(let lineIndex = 0; lineIndex < linesParsed.length; lineIndex++) {
		let line = linesParsed[lineIndex];
		if(typeof line !== "object") continue;

		switch(line.syntax.name) {
			case "If":
			case "Else if":
			case "Else":
			case "Loop list":
			case "Loop nth times":
				if(lineIndex !== spliceIndex) codeBlocks.push(linesParsed.slice(spliceIndex, lineIndex));
				spliceIndex = lineIndex;
				break;
			case "End Keyword":
				codeBlocks.push(linesParsed.slice(spliceIndex, lineIndex));
				spliceIndex = lineIndex + 1;
				break;
		}
	}
	if(spliceIndex !== linesParsed.length) codeBlocks.push(linesParsed.slice(spliceIndex));

	return codeBlocks;
};
module.exports.findSyntax = findSyntax;
