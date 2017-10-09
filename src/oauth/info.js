const infoCache = new Map();
const refresh = require("./refresh");
const superagent = require("superagent");

module.exports = async (token, path) => {
	if(infoCache.has(`${token.accessToken}/${path}`)) return infoCache.get(`${token.access_token}/${path}`);

	let refreshed = false;
	if(Date.now() - token.timestamp >= token.expiresIn) {
		token = await refresh(token);
		refreshed = true;
	}

	const { body } = await superagent.get(`https://discordapp.com/api/${path}`)
		.set("Authorization", `Bearer ${token.accessToken}`);

	infoCache.set(`${token.accessToken}/${path}`, body);
	setTimeout(() => {
		infoCache.delete(`${token.accessToken}/${path}`);
	}, token.expiresIn - (Date.now() - token.timestamp));
	return refreshed ? { token, info: body } : body;
};
