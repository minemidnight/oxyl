const blocks = [{
	name: "nav-bar",
	file: "Navbar"
}];

module.exports = Vue => {
	blocks.forEach(({ name, file }) => Vue.component(name, require(`./components/blocks/${file}.vue`)));
};
