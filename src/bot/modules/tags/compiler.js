const parser = require(`${__dirname}/parser`);
const TagError = require(`${__dirname}/tagError`);

module.exports = async string => {
	const parsed = await parser(string);
};

module.exports(`if member from event-message has perm to ban members:\nreturn "you can ban that member!"\nend`);
