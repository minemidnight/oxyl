module.exports = (ifStatement, elseIfs) => {
	if(!ifStatement.run()) elseIfs.children.find(elseIf => elseIf.run());
};
