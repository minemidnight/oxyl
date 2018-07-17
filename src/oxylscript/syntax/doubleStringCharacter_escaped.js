module.exports = async (_a, escapeSequence) =>
	`\\${await escapeSequence.run()}`;
