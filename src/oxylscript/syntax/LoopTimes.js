function setIndex(block, index) {
	if(block._node.ctorName === "Loop") return;

	block.children.forEach(child => {
		if(child._node.ctorName === "LoopIndex") child.index = index;
		else if(child.children) setIndex(child, index);
	});
}

module.exports = function(_a, count, _b) {
	return block => {
		count = count.run();
		for(let i = 0; i < count; i++) {
			setIndex(block, i + 1);
			block.run();
		}
	};
};
