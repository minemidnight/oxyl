const pace = require("pace-progress");
pace.start();

const API_BASE = `${window.location.origin}/api`;
window.apiCall = async (method, path, options = {}) => {
	try {
		const { headers, body } = await superagent[method](`${API_BASE}/${path}`)
			.set("Authorization", options.token ? JSON.stringify(options.token) : localStorage.token)
			.query(options.query || {})
			.send(options.send || {});

		if(headers["new-token"]) {
			if(!options.auth) localStorage.token = headers["new-token"];
			else return { body, token: headers["new-token"] };
		}

		return { body };
	} catch({ response: { headers, body } }) {
		if(body.redirect && body.redirect.name !== app.$route.name) app.$router.push(body.redirect);
		if(headers["new-token"]) {
			if(!options.auth) localStorage.token = headers["new-token"];
			else return { error: true, body, token: headers["new-token"] };
		}

		return { error: true, body };
	}
};
window.superagent = require("superagent");
window.$ = require("jquery"); // eslint-disable-line id-length
window.Popper = require("popper.js");
window.Tether = require("tether");
require("bootstrap");

const { default: Vue } = require("vue");
require("./blocks")(Vue);
const router = require("./router")(Vue);
window.app = new Vue({ router }).$mount("#app");
