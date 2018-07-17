module.exports = async (_a, text, _b) => {
	let result = "";
	for(const letter of text.children) result += await letter.run();

	return result;
};
