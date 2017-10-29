const config = require("../../config");
const superagent = require("superagent");
module.exports = async (channelID, embed) => {
	await superagent.post(`https://discordapp.com/api/channels/${channelID}/messages`)
		.set("Authorization", `Bot ${config.token}`)
		.send({ embed })
		.catch(err => false); // eslint-disable-line handle-callback-err
};
