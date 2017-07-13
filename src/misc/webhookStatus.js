const superagent = require("superagent");
const webhook = require("../../../config.json").other.webhook;
module.exports = embed => {
	if(!webhook) return false;
	return superagent.post(webhook).send({ embeds: [embed] });
};
