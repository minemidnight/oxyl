module.exports = function(_a, boolean) {
	return block => {
		if(boolean.run()) {
			this.source.ran = true;
			block.run();
		}
	};
};
