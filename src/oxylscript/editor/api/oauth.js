const config = require("../../../../config");
const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const OAuth2 = require("../../../oauth2/index");
const discordAuth = new OAuth2({
	api: "https://discordapp.com/api/",
	oauth2: "https://discordapp.com/api/oauth2/"
}, {
	clientID: config.clientID,
	secret: config.secret,
	redirectURI: config.editorURL
});

module.exports.discordAuth = discordAuth;

router.use("/discord", require("./oauth/discord"));
