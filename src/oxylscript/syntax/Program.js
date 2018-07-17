function addData(element, data) {
	if(element.children) element.children.forEach(child => addData(child, data));
	if(element._node) addData(element._node);

	element.data = data;
}

module.exports = async function(sourceElements) {
	addData(this, this.data);

	for(const sourceElement of sourceElements.children) await sourceElement.run();
};
