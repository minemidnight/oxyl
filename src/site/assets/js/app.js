const pace = require("pace-progress");
pace.start();

window.superagent = require("superagent");

import Vue from "vue";
require("./blocks")(Vue);
const router = require("./router")(Vue);
window.app = new Vue({ router }).$mount("#app");
