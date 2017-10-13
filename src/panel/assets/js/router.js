import VueRouter from "vue-router";

const routes = [{
	name: "bot",
	path: "/bot",
	component: require("./components/pages/Bot.vue")
}, {
	name: "forbidden",
	path: "/forbidden",
	component: require("./components/pages/Forbidden.vue")
}, {
	name: "home",
	path: "/",
	component: require("./components/pages/Overview.vue")
}, {
	name: "processes",
	path: "/processes",
	component: require("./components/pages/Processes.vue")
}];

module.exports = Vue => {
	Vue.use(VueRouter);
	return new VueRouter({
		mode: "history",
		routes
	});
};
