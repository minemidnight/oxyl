const { default: VueRouter } = require("vue-router");

const configEnter = (to, from, next) => {
	if(from.params.guild && to.name === "config") {
		return next({ name: "dashboard", params: from.params });
	} else if(~["config", "dashboard", "selector"].indexOf(to.name) && !localStorage.token) {
		return next({ name: "accounts" });
	} else if(to.name === "config") {
		return next({ name: "selector" });
	} else {
		return next();
	}
};

const routes = [{
	name: "features",
	path: "/features",
	component: require("./components/pages/Features.vue")
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
		name: "dashboard_roblox",
		path: "roblox",
		component: require("./components/pages/config/Roblox.vue")
	}, {
		name: "dashboard_roles",
		path: "roles",
		component: require("./components/pages/config/Roles.vue")
	}, {
		name: "dashboard_twitch",
		path: "twitch",
		component: require("./components/pages/config/Twitch.vue")
	}, {
		name: "dashboard_userlog",
		path: "userlog",
		component: require("./components/pages/config/UserLog.vue")
	}, {
		name: "dashboard_premium",
		path: "premium",
		component: require("./components/pages/config/Premium.vue")
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

function fixComponents(routeList) {
	routeList.forEach(route => {
		if(route.children) fixComponents(route.children);
		if(route.component) route.component = route.component.default;
	});
}

fixComponents(routes);
module.exports = Vue => {
	Vue.use(VueRouter);
	return new VueRouter({
		mode: "history",
		routes
	});
};
