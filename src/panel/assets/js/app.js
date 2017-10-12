const pace = require("pace-progress");
pace.start();

import Vue from "vue";

window.superagent = require("superagent");
window.API_BASE = `${window.location.origin}/api`;

require("./blocks")(Vue);
const router = require("./router")(Vue);
window.app = new Vue({ router }).$mount("#app");

require("./oauth")();
