import routes from "./routes";
import VueRouter from "vue-router";

const fixRoutes = routeList => Object.entries(routeList).map(([key, route]) => {
	if(route.children) route.children = fixRoutes(route.children);

	let display = route.display || key;
	if(display.indexOf("_")) display = display.substring(display.indexOf("_") + 1);
	display = display.charAt(0).toUpperCase() + display.substring(1).split(/[a-z]+[A-Z]/).join(" ");

	const component = route.component;
	return Object.assign(route, {
		name: route.children ? undefined : key,
		display,
		component: () =>
			import(`../pages/${component}.vue`)
	});
});

const router = new VueRouter({
	mode: "history",
	routes: fixRoutes(routes)
});

router.beforeEach(async (to, from, next) => {
	if(to.meta.requiresAuth) {
		if(!localStorage.token) return next({ name: "home" });

		if(!sessionStorage.info) {
			const { error, body } = await apiCall.get("oauth/discord/info")
				.query({ path: "/users/@me" });

			if(error) {
				delete localStorage.token;
				return next(false);
			}

			sessionStorage.info = JSON.stringify(body);
		}

		return next();
	} else {
		return next();
	}
});

export default Vue => {
	Vue.use(VueRouter);

	return router;
};
