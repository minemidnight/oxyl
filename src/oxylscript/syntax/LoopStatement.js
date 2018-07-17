function setIndex(block, index) {
	if(block._node.ctorName === "LoopStatement") return;

	block.children.forEach(child => {
		if(child._node.ctorName === "loopIndexLiteral") child.index = index;
		else if(child.children) setIndex(child, index);
	});
}


module.exports = async (_a, count, _b, statement) => {
	count = await count.run();
	for(let i = 0; i < count; i++) {
		setIndex(statement, i + 1);

		await statement.run();
	}
};
