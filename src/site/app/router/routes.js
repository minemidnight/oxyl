const configEnter = (to, from, next) => {
	if(from.params.guild && to.name === "config") {
		return next({ name: "dashboard", params: from.params });
	} else if(["config", "dashboard", "selector"].includes(to.name) && !localStorage.token) {
		return next({ name: "accounts" });
	} else if(to.name === "config") {
		return next({ name: "selector" });
	} else {
		return next();
	}
};

export default {
	features: {
		path: "/features",
		component: "Features"
	},
	config: {
		path: "/config",
		beforeEnter: configEnter
	},
	accounts: {
		path: "/accounts",
		component: "config/Accounts",
		beforeEnter: configEnter
	},
	selector: {
		path: "/selector",
		component: "config/Selector",
		beforeEnter: configEnter
	},
	dashboard: {
		path: "/config/:guild",
		component: "config/Dashboard",
		children: {
			dashboard: {
				display: "general",
				path: "/",
				component: "config/General",
				icon: "cog"
			},
			dashboard_censors: {
				path: "censors",
				component: "config/Censors",
				icon: "asterisk"
			},
			dashboard_commands: {
				path: "commands",
				component: "config/Commands",
				icon: "exclamation"
			},
			dashboard_modlog: {
				path: "modlog",
				component: "config/ModLog",
				icon: "table"
			},
			dashboard_music: {
				path: "music",
				component: "config/Music",
				icon: "music"
			},
			dashboard_oxylscript: {
				path: "oxylscript",
				component: "config/Oxylscript",
				icon: "code"
			},
			dashboard_reddit: {
				path: "reddit",
				component: "config/Reddit",
				icon: "reddit-alien"
			},
			dashboard_roblox: {
				path: "roblox",
				component: "config/Roblox",
				icon: "id-card"
			},
			dashboard_roles: {
				path: "roles",
				component: "config/Roles",
				icon: "plus-circle"
			},
			dashboard_twitch: {
				path: "twitch",
				component: "config/Twitch",
				icon: "twitch"
			},
			dashboard_userlog: {
				path: "userlog",
				component: "config/UserLog",
				icon: "users"
			},
			dashboard_premium: {
				path: "premium",
				component: "config/Premium",
				icon: "usd"
			}
		},
		beforeEnter: configEnter
	},
	home: {
		path: "/",
		component: "Home"
	},
	invite: {
		path: "/invite",
		component: "Invite"
	},
	patreon: {
		path: "/patreon",
		alias: "/donate",
		component: "Patreon"
	},
	support: {
		path: "/support",
		component: "Support"
	},
	404: {
		path: "/404",
		alias: "*",
		component: "404"
	}
};
