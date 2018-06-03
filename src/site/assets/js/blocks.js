const blocks = [{
	name: "nav-bar",
	file: "Navbar"
}, {
	name: "role-selector",
	file: "RoleSelector"
}, {
	name: "channel-selector",
	file: "ChannelSelector"
}];

module.exports = Vue => {
	blocks.forEach(({ name, file }) => Vue.component(name, require(`./components/blocks/${file}.vue`).default));
};
