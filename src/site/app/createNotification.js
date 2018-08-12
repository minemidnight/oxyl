import notification from "./components/Notification.vue";
import Vue from "vue";

export default slot => {
	const Notification = Vue.extend(notification);
	const instance = new Notification();

	instance.$slots.default = slot;
	instance.$mount();

	app.$el.appendChild(instance.$el);

	return instance;
};
