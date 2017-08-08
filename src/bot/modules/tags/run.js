const parser = require(`${__dirname}/parser`);
const TagError = require(`${__dirname}/tagError`);

async function parseResult(options, returnType, value) {
	if(Array.isArray(returnType)) returnType = returnType[options.matchIndex];
	if(returnType && returnType !== "any") {
		if(returnType.endsWith(" list")) {
			returnType = returnType.substring(0, returnType.length - 5);
			value = value.map(result => options.types[returnType](result));
		} else {
			value = options.types[returnType](value);
		}
	}

	return value;
}

async function getCorrectPattern(options, pattern, invalidPatterns = []) {
	if(options.values.has(pattern)) {
		return options.values.get(pattern);
	} else {
		let found = parser.findSyntax(pattern, invalidPatterns);
		if(found) {
			try {
				return (await getResult(options, found)).value;
			} catch(err) {
				let index = found.syntax.patterns.indexOf(found.pattern);
				invalidPatterns.push({ name: found.syntax.name, index });
				return await getCorrectPattern(options, pattern, invalidPatterns);
			}
		} else {
			throw new TagError(`No syntax or value found for "${pattern}"`);
		}
	}
}

async function getResult(options, { code, pattern, syntax }) {
	options.matchIndex = syntax.patterns.indexOf(pattern);

	let values = [];
	let newPattern = pattern.replace(/%.+?%/g, "(.+?)");
	if(newPattern.endsWith("(.+?)")) newPattern = `${newPattern.substring(0, newPattern.length - 5)}(.+)`;
	newPattern = new RegExp(`^${newPattern}$`, "ig");
	let patternsMatched = newPattern.exec(code);
	if(patternsMatched) patternsMatched = patternsMatched.slice(1).filter(match => match);

	for(let pMatch of patternsMatched) {
		if(!syntax.isType) {
			let value = await getCorrectPattern(options, pMatch);
			values.push(value);
		} else {
			return options.types[syntax.name.toLowerCase()](pMatch);
		}
	}

	if(!syntax.giveRaw) values = values.map(val => val.value !== undefined ? val.value : val);
	let typesExpected = pattern.match(/%.+?%/g);
	if(typesExpected) typesExpected.map(type => type.endsWith("s") ? type.substring(0, type.length - 1) : type);

	let result = await syntax.run(options, ...values);
	let parsed = await parseResult(options, syntax.returns, result);
	return { value: parsed, options };
}

async function runCode(options, codeBlock) {
	let firstLine = codeBlock[0];
	if(firstLine.syntax.name === "If") {
		delete options.doneIf;
		delete options.doElses;

		let value;
		({ options, value } = await getResult(options, firstLine));
		if(value) {
			options.doneIf = true;
			for(let line of codeBlock) ({ options } = await getResult(options, line));
		} else {
			options.doElses = true;
		}
	} else if(firstLine.syntax.name === "Else if") {
		if(options.doneIf) return options;
		else if(!options.doElses) throw new TagError("Else if statement without if statement");

		let value;
		({ options, value } = await getResult(options, firstLine));
		if(value) {
			options.doneIf = true;
			for(let line of codeBlock) ({ options } = await getResult(options, line));
		}
	} else if(firstLine.syntax.name === "Else") {
		if(options.doneIf) return options;
		else if(!options.doElses) throw new TagError("Else statement without if statement");

		for(let line of codeBlock) ({ options } = await getResult(options, line));
	} else if(firstLine.syntax.name === "Loop list") {
		let list;
		({ options, value: list } = await getResult(options, firstLine));
		for(let index of list) {
			let value = list[index];
			options.values.set("loop-value", options.types.integer(value));
			options.values.set("loop-index", options.types.integer(index + 1));

			for(let line of codeBlock) ({ options } = await getResult(options, line));
		}

		options.values.delete("loop-value");
		options.values.delete("loop-index");
	} else if(firstLine.syntax.name === "Loop nth times") {
		let times;
		({ options, value: times } = await getResult(options, firstLine));
		for(let i = times - 1; i--;) {
			options.values.set("loop-number", options.types.integer(i + 1));
			for(let line of codeBlock) ({ options } = await getResult(options, line));
		}

		options.values.delete("loop-number");
	} else {
		for(let line of codeBlock) ({ options } = await getResult(options, line));
	}

	return options;
}

const fs = require("fs");
let types = fs.readdirSync(`${__dirname}/types`)
	.map(type => require(`${__dirname}/types/${type}`))
	.reduce((prev, type) => {
		prev[type.name.toLowerCase()] = type.run;
		return prev;
	}, {});

module.exports = async (options, string) => {
	if(!options.__message) throw new TagError("No __message key in options");
	options = Object.assign(options, {
		TagError,
		types: {},
		typesFunctions: types,
		values: new Map().set("event-message", types.message(options, options.__message)),
		variables: new Map()
	});

	Object.keys(options.typesFunctions).forEach(key => {
		options.types[key] = value => options.typesFunctions[key](options, value);
	});

	const parsed = await parser(options, string);
	for(let codeBlock of parsed) options = await runCode(options, codeBlock);
};
