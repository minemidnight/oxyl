const tokenizer = require("tokenizer2");

const fs = require("fs");
const conditions = fs.readdirSync(`${__dirname}/conditions`);
const effects = fs.readdirSync(`${__dirname}/effects`);
const expressions = fs.readdirSync(`${__dirname}/expressions`);
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

function regexFromPattern(pattern) {
	pattern = replacedNestedBrackets(pattern);
	return new RegExp(`^${pattern}$`, "i");
}

// const parser = tokenizer();
// conditions.forEach(cond => {
// 	let patterns = require(`${__dirname}/conditions/${cond}`).patterns;
// 	if(patterns) {
// 		patterns.map(regexFromPattern)
// 			.forEach((pattern, i) => parser.addRule(pattern, `condition ${cond.substring(0, cond.length - 3)} ${i}`));
// 	}
// });

// effects.forEach(eff => {
// 	let patterns = require(`${__dirname}/effects/${eff}`).patterns;
// 	if(patterns) {
// 		patterns.map(regexFromPattern)
// 			.forEach((pattern, i) => parser.addRule(pattern, `effect ${eff.substring(0, eff.length - 3)} ${i}`));
// 	}
// });

// expressions.forEach(expr => {
// 	let patterns = require(`${__dirname}/expressions/${expr}`).patterns;
// 	if(patterns) {
// 		patterns.map(regexFromPattern)
// 			.forEach((pattern, i) => parser.addRule(pattern, `expression ${expr.substring(0, expr.length - 3)} ${i}`));
// 	}
// });

// loops.forEach(loop => {
// 	let patterns = require(`${__dirname}/loops/${loop}`).patterns;
// 	if(patterns) {
// 		patterns.map(regexFromPattern)
// 			.forEach((pattern, i) => parser.addRule(pattern, `loop ${loop.substring(0, loop.length - 3)} ${i}`));
// 	}
// });

// variables.forEach(variable => {
// 	let patterns = require(`${__dirname}/variables/${variable}`).patterns;
// 	if(patterns) {
// 		patterns.map(regexFromPattern)
// 			.forEach((pattern, i) => parser.addRule(pattern, `variable ${0, variable.substring(variable.length - 3)} ${i}`));
// 	}
// });

module.exports = async string => new Promise((resolve, reject) => {
	const tokenStream = tokenizer();
	tokenStream.addRule(/^end$/, "end keyword");
	tokenStream.addRule(/^\s+$/, "whitespace");

	types.forEach(type => {
		let patterns = require(`${__dirname}/types/${type}`).patterns;
		if(patterns) {
			patterns.map(regexFromPattern)
				.forEach((pattern, i) => tokenStream.addRule(pattern, `type ${type.substring(0, type.length - 3)} ${i}`));
		}
	});

	let tokens = [];
	tokenStream.write(string);
	console.log("tokenizing", string);
	tokenStream.on("data", token => console.log(token));

	tokenStream.on("end", () => {
		console.log("FINISHED");
		resolve(tokens);
	});
});
