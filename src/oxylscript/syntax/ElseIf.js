module.exports = function(_a, boolean) {
	return block => {
		if(!this.source.ran && boolean.run()) {
			this.source.ran = true;
			block.run();
		}
	};
};
