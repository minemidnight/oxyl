import VueRouter from "vue-router";

const routes = [{
	name: "forbidden",
	path: "/forbidden",
	component: require("./components/pages/Forbidden.vue")
}, {
	name: "home",
	path: "/",
	component: require("./components/pages/Home.vue")
}, {
	name: "overview",
	path: "/important",
	component: require("./components/pages/Overview.vue")
}];

module.exports = Vue => {
	Vue.use(VueRouter);
	return new VueRouter({
		mode: "history",
		routes
	});
};
