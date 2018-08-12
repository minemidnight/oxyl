import apiCall from "./apiCall";
import createRouter from "./router/index";
import pace from "pace-progress";
import registerComponents from "./components/index";
import Vue from "vue";
import VueScrollReveal from "vue-scroll-reveal";

pace.start();
Vue.use(VueScrollReveal);
registerComponents(Vue);

window.apiCall = apiCall;
window.app = new Vue({ router: createRouter(Vue) }).$mount("#app");
