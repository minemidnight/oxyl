const pace = require("pace-progress");
pace.start();

window.superagent = require("superagent");
window.$ = require("jquery"); // eslint-disable-line id-length
window.Popper = require("popper.js");
window.Tether = require("tether");
require("bootstrap");

import Vue from "vue";
require("./blocks")(Vue);
const router = require("./router")(Vue);
window.app = new Vue({ router }).$mount("#app");
