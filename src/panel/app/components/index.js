const components = ["Modal", "Navbar", "Worker"];

export default Vue => components
	.forEach(file => Vue.component(file.toLowerCase(), () =>
		import(`./${file}.vue`)));
