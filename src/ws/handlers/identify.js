const config = require("../../../config");
const codes = require("../codes");
const errorFormat = require("../format/error");

const OAuth2 = require("../../oauth2/index");
const discordAuth = new OAuth2({
	api: "https://discordapp.com/api/",
	oauth2: "https://discordapp.com/api/oauth2/"
}, {
	clientID: config.clientID,
	secret: config.secret,
	redirectURI: config.panelURL
});


/*
{
	op: "identify"
	token: { accessToken: "", expiresIn: 60480000, refreshToken: "", timestamp: 1532836202287 }
}
*/

module.exports = async (client, message) => {
	if(!message.token) {
		client.send(errorFormat({
			message: "No token provided for identify",
			code: codes.NO_TOKEN
		}));

		return;
	}

	const info = await discordAuth.info(message.token, "users/@me");
	process.logger.info("websocket", `User ${info.id} (${info.username}#${info.discriminator}) identified, ` +
		`authorized: ${!!config.owners.includes(info.id)}`);

	if(!config.owners.includes(info.id)) {
		client.send(errorFormat({
			message: "You are not a owner of Oxyl, you are not allowed to use this websocket",
			code: codes.NOT_OWNER
		}));

		client.terminate();
		return;
	}

	client.authorized = true;
	client.heartbeat();
};
