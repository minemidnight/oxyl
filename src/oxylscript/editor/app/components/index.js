const components = ["Editor"];

export default Vue => components
	.forEach(file => Vue.component(file.toLowerCase(), () =>
		import(`./${file}.vue`)));
