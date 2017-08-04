const parser = require(`${__dirname}/parser`);
const TagError = require(`${__dirname}/tagError`);

async function getResult(options, { code, pattern, syntax }) {
	options.matchIndex = syntax.patterns.indexOf(pattern);
	let typesExpected = pattern.match(/%.*?%/g);
	let newPattern = new RegExp(`^${pattern.replace(/%.*?%/g, "(.*?)")}$`, "ig");

	let patternsMatched = newPattern.exec(code);
	if(patternsMatched) patternsMatched = patternsMatched.slice(1).filter(match => match);

	let values = [];
	patternsMatched.forEach(pMatch => {
		let value;
		if(options.values.has(pMatch)) {
			values.push(options.values.get(pMatch));
		} else {
			let found = parser.findSyntax(pMatch);
			if(found) {
				let res = getResult(options, found);

				let returnType = found.syntax.returns;
				if(Array.isArray(returnType)) returnType = returnType[options.matchIndex];
				if(returnType && returnType !== "any") {
					if(returnType.endsWith(" list")) {
						returnType = returnType.substring(0, returnType.length - 5);
						res = res.map(result => options.types[found.syntax.returns].run(options, result));
					} else {
						res = options.types[found.syntax.returns].run(options, res);
					}
				}

				values.push(res);
			} else {
				throw new TagError(`No syntax or value found for "${pMatch}"`);
			}
		}
	});

	if(!syntax.giveFullLists) values = values.map(val => val.value ? val.value : val);
	return await syntax.run(options, ...values);
}

async function runCode(options, codeBlock) {
	let firstLine = codeBlock[0];
	if(firstLine.syntax.name === "If") {
		delete options.doneIf;
		delete options.doElses;

		let res = await getResult(options, firstLine);
		if(res) {
			options.doneIf = true;
			for(let line of codeBlock) {
				options = await getResult(options, line);
			}
		} else {
			options.doElses = true;
		}
	} else if(firstLine.syntax.name === "Else if") {
		if(options.doneIf) return options;
		else if(!options.doElses) throw new TagError("Else if statement without if statement");

		let res = await getResult(options, firstLine);
		if(res) {
			options.doneIf = true;
			for(let line of codeBlock) {
				options = await getResult(options, line);
			}
		}
	} else if(firstLine.syntax.name === "Else") {
		if(options.doneIf) return options;
		else if(!options.doElses) throw new TagError("Else statement without if statement");

		for(let line of codeBlock) {
			options = await getResult(options, line);
		}
	} else if(firstLine.syntax.name === "Loop list") {
		let list = await getResult(options, firstLine);
		for(let index of list) {
			let value = list[index];
			options.values.set("loop-value", value);
			options.values.set("loop-index", index + 1);

			for(let line of codeBlock) {
				options = await getResult(options, line);
			}
		}

		options.values.delete("loop-value");
		options.values.delete("loop-index");
	} else if(firstLine.syntax.name === "Loop nth times") {
		let times = await getResult(options, firstLine);
		for(let i = times - 1; i--;) {
			options.values.set("loop-number", i + 1);
			for(let line of codeBlock) {
				options = await getResult(options, line);
			}
		}

		options.values.delete("loop-number");
	} else {
		for(let line of codeBlock) {
			options = await getResult(options, line);
		}
	}

	return options;
}

const fs = require("fs");
let types = fs.readdirSync(`${__dirname}/types`)
	.map(type => require(`${__dirname}/types/${type}`))
	.reduce((prev, type) => {
		prev[type.name.toLowerCase()] = type;
		return prev;
	}, {});

module.exports = async (options, string) => {
	if(!options.__message) throw new TagError("No __message key in options");
	options = Object.assign(options, {
		TagError,
		types,
		values: new Map().set("event-message", types.message.run(options, options.__message)),
		variables: new Map()
	});

	const parsed = await parser(options, string);
	for(let codeBlock of parsed) options = await runCode(options, codeBlock);
};

process.on("unhandledRejection", err => console.log(err.stack));
module.exports({ __message: { author: { id: "123", username: "hello" } } },
	require("fs").readFileSync(`${__dirname}/tag.txt`, "utf8"));
