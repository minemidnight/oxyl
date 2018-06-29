module.exports = (ifStatement, elseStatement) => {
	if(!ifStatement.run()) elseStatement.run();
};
