const components = ["ChannelSelector", "Navbar", "RoleSelector"];

export default Vue => components
	.forEach(file => Vue.component(file.toLowerCase(), () => import(`./${file}.vue`)));
