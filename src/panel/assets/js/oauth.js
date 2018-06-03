window.getInfo = async path => {
	let { body } = await superagent.get(`${API_BASE}/info/`)
		.set("Authorization", localStorage.token)
		.query({ path });

	if(body.token) {
		localStorage.token = JSON.stringify(body.token);
		body = body.info;
	}

	return body;
};

module.exports = async () => {
	const { body: { clientID, owners } } = await superagent.get(`${API_BASE}/config`);
	if(!localStorage.token) {
		const { code } = app.$route.query;
		if(!code) {
			window.location.href = `https://discordapp.com/oauth2/authorize?response_type=code&redirect_uri=` +
				`${encodeURIComponent(window.location.origin)}&scope=identify&client_id=${clientID}`;
			return;
		}

		const { body } = await superagent.post(`${API_BASE}/callback`).send({ code });
		localStorage.token = JSON.stringify(body);
		app.$router.replace(window.location.pathname);
	}

	const { id } = await getInfo("/users/@me");

	if(!~owners.indexOf(id)) {
		window.location.pathname = app.$router.push({ name: "forbidden" });
		return;
	}

	app.$router.push({ name: "home" });
	if(!app.ws) app.ws = await require("./ws")();
};
