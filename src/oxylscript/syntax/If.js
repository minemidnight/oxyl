module.exports = function(_a, boolean, block) {
	if(boolean.run()) {
		block.run();
		return true;
	} else {
		return false;
	}
};
