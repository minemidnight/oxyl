const config = require("../../config");
const superagent = require("superagent");

module.exports = async (code, redirect) => {
	const { body } = await superagent.post("https://discordapp.com/api/oauth2/token")
		.type("form")
		.send({
			client_id: config.clientID, // eslint-disable-line camelcase
			client_secret: config.secret, // eslint-disable-line camelcase
			code,
			grant_type: "authorization_code", // eslint-disable-line camelcase
			redirect_uri: redirect // eslint-disable-line camelcase
		});

	return {
		accessToken: body.access_token,
		expiresIn: body.expires_in,
		refreshToken: body.refresh_token,
		timestamp: Date.now()
	};
};
