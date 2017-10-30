import VueRouter from "vue-router";

const routes = [{
	name: "commands",
	path: "/commands",
	component: require("./components/pages/Commands.vue")
}, {
	name: "config",
	path: "/config",
	component: require("./components/pages/Config.vue")
}, {
	name: "home",
	path: "/",
	component: require("./components/pages/Home.vue")
}, {
	name: "invite",
	path: "/invite",
	component: require("./components/pages/Invite.vue")
}, {
	name: "patreon",
	path: "/patreon",
	alias: "/donate",
	component: require("./components/pages/Patreon.vue")
}, {
	name: "support",
	path: "/support",
	component: require("./components/pages/Support.vue")
}];

module.exports = Vue => {
	Vue.use(VueRouter);
	return new VueRouter({
		mode: "history",
		routes
	});
};
