const pace = require("pace-progress");
pace.start();

window.apiCall = require("./apiCall");
window.superagent = require("superagent");
window.$ = require("jquery"); // eslint-disable-line id-length
window.Popper = require("popper.js");
window.Tether = require("tether");
require("bootstrap");

const { default: Vue } = require("vue");
require("./blocks")(Vue);
const router = require("./router")(Vue);
window.app = new Vue({ router }).$mount("#app");
