module.exports = function(node) {
	return block => {
		if(!this.source.ran) {
			this.source.ran = true;
			block.run();
		}
	};
};
