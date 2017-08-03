const parser = require(`${__dirname}/parser`);
const TagError = require(`${__dirname}/tagError`);

function parseType(options, value, type) {
	return require(`${__dirname}/types/${type}`).run(options, value);
}

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

				if(found.syntax.returns) res = parseType(options, res, found.syntax.returns);
				values.push(res);
			} else {
				throw new TagError(`No syntax or value found for ${pMatch}`);
			}
		}
	});

	values = values.map(val => val.value ? val.value : val);
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
	} else {
		for(let line of codeBlock) {
			options = await getResult(options, line);
		}
	}

	return options;
}

module.exports = async (options, string) => {
	if(!options.__message) throw new TagError("No __message key in options");
	options.values = new Map().set("event-message", options.__message);
	options.variables = new Map();

	const parsed = await parser(options, string);
	for(let codeBlock of parsed) options = await runCode(options, codeBlock);
};

process.on("unhandledRejection", console.log);
module.exports({ __message: { author: { id: "123", username: "hello" } } },
	require("fs").readFileSync(`${__dirname}/tag.txt`, "utf8"));
