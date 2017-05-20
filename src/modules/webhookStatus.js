const request = require("request-promise");
const privateConfig = JSON.parse(require("fs").readFileSync("private-config.json").toString());
module.exports = embed => {
	if(!privateConfig.webhook) return false;
	return request({
		method: "POST",
		url: privateConfig.webhook,
		json: true,
		body: { embeds: [embed] }
	});
};
