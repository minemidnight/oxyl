module.exports = async (_a, statements, _b) => {
	for(const statement of statements.children) await statement.run();
};
