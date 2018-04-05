const API_BASE = "http://api.paladins.com/paladinsapi.svc";
const crypto = require("crypto");
const superagent = require("superagent");
const config = require("../../../config.json");

class APIRequest {
	constructor(api) {
		this.api = api;
		this.paths = [];
		this.endpoint = null;
	}

	setEndpoint(endpoint) {
		this.endpoint = endpoint;

		return this;
	}

	data(...data) {
		this.paths.push(...data);

		return this;
	}

	get signature() {
		return crypto.createHash("md5")
			.update(this.api.devId + this.endpoint + this.api.authKey + this.api.timestamp())
			.digest("hex");
	}

	url(useSession = true) {
		let url = API_BASE;
		url += `/${this.endpoint}Json`;
		url += `/${this.api.devId}`;
		url += `/${this.signature}`;

		if(useSession) url += `/${this.api.session}`;

		url += `/${this.api.timestamp()}`;
		if(this.paths.length) url += `/${this.paths.join("/")}`;

		return url;
	}

	then(fulfilled, errored) {
		this.send().then(fulfilled, errored);
	}

	async send(useSession) {
		const { body } = await superagent.get(this.url(useSession));
		return body;
	}
}

class PaladinsAPI {
	constructor(devId, authKey) {
		this.devId = devId;
		Object.defineProperty(this, "authKey", { value: authKey });
		this.createSession();
	}

	async createSession() {
		const { session_id: session } = await new APIRequest(this).setEndpoint("createsession").send(false);
		this.session = session;

		setTimeout(() => this.createSession(), 885000);
	}

	timestamp(time = Date.now()) {
		time = new Date(time + (new Date().getTimezoneOffset() * 60000));

		return time.getFullYear() +
			(time.getMonth() + 1).toString().padStart(2, "0") +
			time.getDate().toString().padStart(2, "0") +
			time.getHours().toString().padStart(2, "0") +
			time.getMinutes().toString().padStart(2, "0") +
			time.getSeconds().toString().padStart(2, "0");
	}
}

const api = new PaladinsAPI(config.paladinsDevId, config.paladinsAuthKey);
module.exports = {
	api,
	request: () => new APIRequest(api),
	champions() { return champions; },
	items() { return items; }
};

let champions, items;
setTimeout(async () => {
	champions = await module.exports.request().setEndpoint("getchampions").data(1);
	items = await module.exports.request().setEndpoint("getitems").data(1);
}, 4000);
