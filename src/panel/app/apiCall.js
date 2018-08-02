import superagent from "superagent";

const API_BASE = `${window.location.origin}/api`;

async function makeCall(request, token) {
	try {
		const { headers, body } = await new Promise((resolve, reject) => {
			request.set("Authorization", token).end((err, res) => {
				if(err) reject(err);
				else resolve(res);
			});
		});

		if(headers["new-token"]) localStorage.token = headers["new-token"];

		return { body };
	} catch({ response: { headers, body } }) {
		if(body.redirect && body.redirect.name !== app.$route.name) app.$router.push(body.redirect);

		if(headers["new-token"]) localStorage.token = headers["new-token"];
		return { error: true, body };
	}
}

export default ["get", "post", "delete", "head", "patch", "post", "put"]
	.reduce((a, b) => {
		a[b] = (...args) => {
			const request = superagent[b](`${API_BASE}/${args[0]}`);
			request.then = (cb, errCb) => makeCall(request, localStorage.token).then(cb, errCb);

			return request;
		};

		return a;
	}, {});
