const { default: VueRouter } = require("vue-router");

const configEnter = (to, from, next) => {
	if(from.params.guild && to.name === "config") {
		return next({ name: "dashboard", params: from.params });
	} else if(~["config", "dashboard", "selector"].indexOf(to.name) && !localStorage.token) {
		return next({ name: "accounts" });
	} else if(to.name === "config") { return next({ name: "selector" }); } else {
		return next();
	}
};

const routes = [{
	name: "commands",
	path: "/commands",
	component: require("./components/pages/Commands.vue")
}, {
	name: "config",
	path: "/config",
	beforeEnter: configEnter
}, {
	name: "accounts",
	path: "/accounts",
	component: require("./components/pages/config/Accounts.vue"),
	beforeEnter: configEnter
}, {
	name: "selector",
	path: "/selector",
	component: require("./components/pages/config/Selector.vue"),
	beforeEnter: configEnter
}, {
	path: "/config/:guild",
	component: require("./components/pages/config/Dashboard.vue"),
	children: [{
		name: "dashboard",
		path: "/",
		component: require("./components/pages/config/General.vue")
	}, {
		name: "dashboard_censors",
		path: "censors",
		component: require("./components/pages/config/Censors.vue")
	}, {
		name: "dashboard_commands",
		path: "commands",
		component: require("./components/pages/config/Commands.vue")
	}, {
		name: "dashboard_modlog",
		path: "modlog",
		component: require("./components/pages/config/ModLog.vue")
	}, {
		name: "dashboard_music",
		path: "music",
		component: require("./components/pages/config/Music.vue")
	}, {
		name: "dashboard_reddit",
		path: "reddit",
		component: require("./components/pages/config/Reddit.vue")
	}, {
		name: "dashboard_roles",
		path: "roles",
		component: require("./components/pages/config/Roles.vue")
	}, {
		name: "dashboard_tags",
		path: "tags",
		component: require("./components/pages/config/Tags.vue")
	}, {
		name: "dashboard_twitch",
		path: "twitch",
		component: require("./components/pages/config/Twitch.vue")
	}, {
		name: "dashboard_userlog",
		path: "userlog",
		component: require("./components/pages/config/UserLog.vue")
	}],
	beforeEnter: configEnter
}, {
	name: "home",
	path: "/",
	component: require("./components/pages/Home.vue")
}, {
	name: "invite",
	path: "/invite",
	component: require("./components/pages/Invite.vue")
}, {
	name: "oauth",
	path: "/oauth",
	component: require("./components/pages/OAuth.vue")
}, {
	name: "patreon",
	path: "/patreon",
	alias: "/donate",
	component: require("./components/pages/Patreon.vue")
}, {
	name: "support",
	path: "/support",
	component: require("./components/pages/Support.vue")
}, {
	name: "404",
	path: "/404",
	alias: "*",
	component: require("./components/pages/404.vue")
}];

module.exports = Vue => {
	Vue.use(VueRouter);
	return new VueRouter({
		mode: "history",
		routes
	});
};
