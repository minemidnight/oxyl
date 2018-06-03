const config = require("../../../config");
const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

const OAuth2 = require("../../oauth2/index");
const discordAuth = new OAuth2({
	api: "https://discordapp.com/api/",
	oauth2: "https://discordapp.com/api/oauth2/"
}, {
	clientID: config.clientID,
	secret: config.secret,
	redirectURI: config.dashboardURL
});

const patreonAuth = new OAuth2({
	api: "https://www.patreon.com/api/oauth2/api/",
	oauth2: "https://www.patreon.com/api/oauth2/"
}, {
	clientID: config.patreon.clientID,
	secret: config.patreon.secret,
	redirectURI: config.dashboardURL
}, { expireTime: 600000 });

module.exports.discordAuth = discordAuth;
module.exports.patreonAuth = patreonAuth;

router.use("/discord", require("./oauth/discord"));
router.use("/patreon", require("./oauth/patreon"));
