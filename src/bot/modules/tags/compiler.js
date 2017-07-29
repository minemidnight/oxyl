const tokenizer = require(`${__dirname}/tokenizer`);
const TagError = require(`${__dirname}/tagError`);

module.exports = async string => {
	string = string.replace(/  +/g, " ");
	const tokenized = await tokenizer.tokenize(string);

	let lines = [], currentLine = [];
	for(let token of tokenized) {
		if(token.type === "newline") {
			lines.push(currentLine);
			currentLine = [];
		} else {
			currentLine.push(token);
		}
	}
	lines.push(currentLine);

	let readyToParse = lines.slice();
	currentLine = [];

	console.log(lines);
};

module.exports(`if member from event-message has perm to ban members:\nreturn "you can ban that member!"\nend`);
