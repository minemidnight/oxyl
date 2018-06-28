function addData(element, data) {
	if(element.children) element.children.forEach(child => addData(child, data));
	if(element._node) addData(element._node);

	element.data = data;
}

module.exports = function(node) {
	addData(this, this.data);

	return node.run();
};
