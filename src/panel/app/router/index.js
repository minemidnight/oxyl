import routes from "./routes";
import store from "../store";
import VueRouter from "vue-router";
import ws from "../ws/index";

const fixRoutes = routeList => Object.entries(routeList).map(([key, route]) => {
	if(route.children) route.children = fixRoutes(route.children);

	let display = route.display || key;
	if(display.includes("_")) display = display.substring(display.indexOf("_") + 1);
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
	if(to.name === "forbidden") {
		return next();
	} else if(to.name === "home" && to.query.code) {
		const { error, body: token } = await apiCall.post("oauth/discord/callback")
			.send({ code: to.query.code });

		if(error) return next(false);
		else localStorage.token = JSON.stringify(token);

		if(window.opener) {
			const { app } = window.opener;
			if(app.$route.name === "home") window.opener.location.reload();
			else app.$router.replace({ name: "home" });

			window.close();
			return next(false);
		} else {
			return next({ name: "home" });
		}
	} else if(localStorage.token && store.authorized === null) {
		const { body: { authorized } } = await apiCall.get("oauth/discord/authorized");

		store.authorized = authorized;
		if(!authorized) {
			return next({ name: "forbidden" });
		} else {
			const { body: { workers } } = await apiCall.get("workers");

			workers.forEach(worker => {
				app.$set(store.workers, worker.id, {
					id: worker.id,
					startTime: worker.startTime,
					status: worker.status,
					type: worker.type,
					memoryUsage: worker.memoryUsage,
					guilds: worker.guilds,
					streams: worker.streams,
					chartData: {
						memoryUsage: null,
						guilds: null,
						streams: null
					}
				});
			});

			store.ws = await ws();

			return next();
		}
	} else if(store.authorized) {
		return next();
	} else if(!store.authorized && store.authorized !== null) {
		return next({ name: "forbidden" });
	} else {
		const { body: { clientID } } = await apiCall.get("oauth/discord/clientid");
		const url = "https://discordapp.com/oauth2/authorize?response_type=code" +
			`&redirect_uri=${encodeURIComponent(window.location.origin)}` +
			`&scope=identify&client_id=${clientID}`;

		const options = `dependent=yes,width=500,height=${window.innerHeight}`;
		const popup = window.open(url, "_blank", options);
		if(!popup) window.location = url;
		else popup.focus();

		return next(false);
	}
});

export default Vue => {
	Vue.use(VueRouter);
	return router;
};
