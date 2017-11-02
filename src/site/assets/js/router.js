import VueRouter from "vue-router";

const routes = [{
	name: "commands",
	path: "/commands",
	component: require("./components/pages/Commands.vue")
}, {
	name: "config",
	path: "/config",
	component: require("./components/pages/Config.vue"),
	children: [{
		name: "general",
		path: "/",
		component: require("./components/pages/config/General.vue")
	}, {
		name: "censors",
		path: "censors",
		component: require("./components/pages/config/Censors.vue")
	}, {
		name: "config_commands",
		path: "commands",
		component: require("./components/pages/config/Commands.vue")
	}, {
		name: "modlog",
		path: "modlog",
		component: require("./components/pages/config/ModLog.vue")
	}, {
		name: "music",
		path: "music",
		component: require("./components/pages/config/Music.vue")
	}, {
		name: "reddit",
		path: "reddit",
		component: require("./components/pages/config/Reddit.vue")
	}, {
		name: "roles",
		path: "roles",
		component: require("./components/pages/config/Roles.vue")
	}, {
		name: "tags",
		path: "tags",
		component: require("./components/pages/config/Tags.vue")
	}, {
		name: "twitch",
		path: "twitch",
		component: require("./components/pages/config/Twitch.vue")
	}, {
		name: "userlog",
		path: "userlog",
		component: require("./components/pages/config/UserLog.vue")
	}]
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
