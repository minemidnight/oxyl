const tokenizer = require(`${__dirname}/tokenizer`);
const TagError = require(`${__dirname}/tagError`);

module.exports = async string => {
	const tokenized = await tokenizer(string);
	console.log("ended", tokenized);
};

module.exports(`"you dont have perms for that!"\nend`);
