module.exports = async (_a, expression, ifStatement, _b, elseStatement) => {
	if(await expression.run()) await ifStatement.run();
	else await elseStatement.run();
};
