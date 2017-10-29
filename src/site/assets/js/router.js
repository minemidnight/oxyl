import VueRouter from "vue-router";

const routes = [{
	name: "home",
	path: "/",
	component: require("./components/pages/Home.vue")
}];

module.exports = Vue => {
	Vue.use(VueRouter);
	return new VueRouter({
		mode: "history",
		routes
	});
};
