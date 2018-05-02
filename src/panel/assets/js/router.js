import VueRouter from "vue-router";

const routes = [{
	name: "forbidden",
	path: "/forbidden",
	component: require("./components/pages/Forbidden.vue")
}, {
	name: "home",
	path: "/",
	component: require("./components/pages/Home.vue")
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
