const superagent = require("superagent");
const config = require("config.json");
module.exports = embed => {
	if(!config.webhook) return false;
	return superagent.post(config.webhook).send({ embeds: [embed] });
};
