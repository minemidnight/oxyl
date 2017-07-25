const superagent = require("superagent");
const webhook = require(require("path").resolve("config.json")).other.webhook;
module.exports = async embed => {
	if(!webhook) return false;
	return await superagent.post(webhook).send({ embeds: [embed] });
};
