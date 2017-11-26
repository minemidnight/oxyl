const API_BASE = `${window.location.origin}/api`;
async function makeCall(request, token) {
	try {
		const { headers, body } = await new Promise((resolve, reject) => {
			request.set("Authorization", token).end((err, res) => {
				if(err) reject(err);
				else resolve(res);
			});
		});

		if(headers["new-token"]) {
			if(!token) localStorage.token = headers["new-token"];
			else return { body, token: JSON.parse(headers["new-token"]) };
		}

		return { body };
	} catch({ response: { headers, body } }) {
		if(body.redirect && body.redirect.name !== app.$route.name) app.$router.push(body.redirect);
		if(headers["new-token"]) {
			if(!token) localStorage.token = headers["new-token"];
			else return { error: true, body, token: JSON.parse(headers["new-token"]) };
		}

		return { error: true, body };
	}
}

const tokenFields = ["accessToken", "expiresIn", "refreshToken", "timestamp"];
module.exports = ["get", "post", "delete", "head", "patch", "post", "put"]
	.reduce((a, b) => {
		a[b] = (...args) => {
			let token = localStorage.token;
			if(typeof args[1] === "object" && tokenFields.every(field => args[1][field])) token = args.splice(1, 1)[0];

			const request = superagent[b](`${API_BASE}/${args[0]}`);
			request.token = tokenToUse => {
				token = typeof tokenToUse === "object" ? JSON.stringify(tokenToUse) : tokenToUse;
				return request;
			};
			request.then = cb => makeCall(request, token).then(cb);

			return request;
		};

		return a;
	}, {});
