const superagent = require("superagent");

class OAuth2 {
	constructor(baseURLs, data, options = {}) {
		this.baseURLs = {
			api: baseURLs.api,
			oauth2: baseURLs.oauth2
		};

		this.clientID = data.clientID;
		this.secret = data.secret;
		this.redirectURI = data.redirectURI;

		this.expireTime = token => options.expireTime || token.expiresIn - (Date.now() - token.timestamp);
		this.infoCache = new Map();
	}

	async info(token, path) {
		if(this.infoCache.has(`${token.accessToken}/${path}`)) return this.infoCache.get(`${token.accessToken}/${path}`);

		let refreshed = false;
		if((Date.now() - token.timestamp) >= token.expiresIn) {
			token = await this.refresh(token);
			refreshed = true;
		}

		const { body } = await superagent.get(this.apiURL(path))
			.set("Authorization", `Bearer ${token.accessToken}`);

		this.infoCache.set(`${token.accessToken}/${path}`, body);
		setTimeout(() => this.infoCache.delete(`${token.accessToken}/${path}`), this.expireTime(token));

		return refreshed ? { token, info: body } : body;
	}

	async token(code) {
		const { body } = await superagent.post(this.oauth2URL("token"))
			.type("form")
			.send({
				client_id: this.clientID, // eslint-disable-line camelcase
				client_secret: this.secret, // eslint-disable-line camelcase
				code,
				grant_type: "authorization_code", // eslint-disable-line camelcase
				redirect_uri: this.redirectURI // eslint-disable-line camelcase
			});

		return {
			accessToken: body.access_token,
			expiresIn: body.expires_in * 1000,
			refreshToken: body.refresh_token,
			timestamp: Date.now()
		};
	}

	async refresh(token) {
		const refreshToken = token.refreshToken || token;
		const { body } = await superagent.post(this.oauth2URL("token"))
			.type("form")
			.send({
				client_id: this.clientID, // eslint-disable-line camelcase
				client_secret: this.secret, // eslint-disable-line camelcase
				grant_type: "refresh_token", // eslint-disable-line camelcase
				refresh_token: refreshToken // eslint-disable-line camelcase
			});

		return {
			accessToken: body.access_token,
			expiresIn: body.expires_in * 1000,
			refreshToken: body.refresh_token,
			timestamp: Date.now()
		};
	}

	oauth2URL(path) {
		return `${this.baseURLs.oauth2}${path}`;
	}

	apiURL(path) {
		return `${this.baseURLs.api}${path}`;
	}
}

module.exports = OAuth2;
