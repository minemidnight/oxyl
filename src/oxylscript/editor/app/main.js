import apiCall from "./apiCall";
import createRouter from "./router/index";
import pace from "pace-progress";
import Vue from "vue";
import VueScrollReveal from "vue-scroll-reveal";

window.apiCall = apiCall;

pace.start();
Vue.use(VueScrollReveal);

window.app = new Vue({ router: createRouter(Vue) }).$mount("#app");
