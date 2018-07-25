export default {
	home: {
		path: "/",
		component: "Home"
	},
	404: {
		path: "*",
		component: "404"
	},
	dashboard: {
		path: "/dashboard",
		component: "Dashboard",
		meta: { requiresAuth: true }
	},
	editor: {
		path: "/editor/:id",
		component: "Editor",
		meta: { requiresAuth: true }
	}
};
