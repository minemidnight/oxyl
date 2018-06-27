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

export default Vue => {
	Vue.use(VueRouter);
	return new VueRouter({
		mode: "history",
		routes: fixRoutes(routes)
	});
};
