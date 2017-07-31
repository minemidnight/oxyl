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

	return string;
}

function regexFromPattern(pattern, replace) {
	if(replace !== false) pattern = replacedNestedBrackets(pattern);
	return pattern.replace(/\((.*?)\)/g, "(?:$1)");
}

let syntaxes = [];
conditions.forEach(cond => {
	let file = require(`${__dirname}/conditions/${cond}`);
	file.patterns = file.patterns.map(regexFromPattern);
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

variables.forEach(variable => {
	let file = require(`${__dirname}/variables/${variable}`);
	file.patterns = file.patterns.map(regexFromPattern);
	syntaxes.push(file);
});

types.forEach(type => {
	let file = require(`${__dirname}/types/${type}`);
	if(file.patterns) {
		file.patterns = file.patterns.map(pattern => regexFromPattern(pattern, false));
		syntaxes.push(file);
	}
});

syntaxes.push({ name: "If Statement", patterns: ["if (.*):"] });
syntaxes.push({ name: "Else If Statement", patterns: ["el( if)? (.*):"] });
syntaxes.push({ name: "Else", patterns: ["el( if)? (.*):"] });
syntaxes.push({ name: "End Keyword", patterns: ["end"] });

function findSyntax(string) {
	let patternFound;
	let syntax = syntaxes.find(syn => {
		let find = syn.patterns.find(pattern => new RegExp(`^${pattern.replace(/%.*?%/, "(.*?)")}$`, "i").test(string));
		if(find) {
			patternFound = find;
			return true;
		} else {
			return false;
		}
	});
	return [patternFound, syntax];
}

function getResult(pattern, syntax) {

}

module.exports = async string => {
	string = string.replace(/  +/g, " ");
	let lines = string.split("\n");
	for(let line of lines) {
		line = line.trim();
		let [pattern, syntax] = findSyntax(line);
	}
};
