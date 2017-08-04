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
			if(string.charAt(pop - 2) === " ") {
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

	return string.replace(/\((.*?)\)/g, "(?:$1)");
}

function regexFromPattern(pattern, replace) {
	if(replace !== false) pattern = replacedNestedBrackets(pattern);
	return pattern;
}

let syntaxes = [];
syntaxes.push({ name: "End Keyword", patterns: ["end"] });

ifStatements.forEach(ifStatement => {
	let file = require(`${__dirname}/ifStatements/${ifStatement}`);
	file.patterns = file.patterns.map(pattern => `${regexFromPattern(pattern, false)}:`);
	syntaxes.push(file);
});

loops.forEach(loop => {
	let file = require(`${__dirname}/loops/${loop}`);
	file.patterns = file.patterns.map(pattern => `${regexFromPattern(pattern)}:`);
	syntaxes.push(file);
});

effects.forEach(eff => {
	let file = require(`${__dirname}/effects/${eff}`);
	file.patterns = file.patterns.map(regexFromPattern);
	syntaxes.push(file);
});

expressions.forEach(expr => {
	let file = require(`${__dirname}/expressions/${expr}`);
	file.patterns = file.patterns.map(regexFromPattern);
	syntaxes.push(file);
});

variables.forEach(variable => {
	let file = require(`${__dirname}/variables/${variable}`);
	file.patterns = file.patterns.map(regexFromPattern);
	syntaxes.push(file);
});

conditions.forEach(cond => {
	let file = require(`${__dirname}/conditions/${cond}`);
	file.patterns = file.patterns.map(regexFromPattern);
	file.returns = "boolean";
	syntaxes.push(file);
});

types.forEach(type => {
	let file = require(`${__dirname}/types/${type}`);
	if(file.patterns) {
		file.patterns = file.patterns.map(pattern => regexFromPattern(pattern, false));
		syntaxes.push(file);
	}
});

function findSyntax(string) {
	let patternFound;
	let syntax = syntaxes.find(syn => {
		patternFound = syn.patterns
			.find(pattern => new RegExp(`^${pattern.replace(/%.*?%/g, "(.*?)")}$`, "i").test(string));
		if(patternFound) {
			return true;
		} else {
			return false;
		}
	});
	return syntax ? { code: string, pattern: patternFound, syntax } : undefined;
}

module.exports = async (options, string) => {
	string = string.replace(/  +/g, " ");
	let lineStrings = string.split("\n");
	let linesParsed = [];
	for(let line of lineStrings) {
		if(line.endsWith(";")) line = line.substring(0, line.length - 1).trim();
		else line = line.trim();

		let found = findSyntax(line);
		if(!found) throw new TagError(`No syntax found for "${line}"`);
		linesParsed.push(found);
	}

	let codeBlocks = [], spliceIndex = 0;
	for(let lineIndex = 0; lineIndex < linesParsed.length; lineIndex++) {
		let line = linesParsed[lineIndex];
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
