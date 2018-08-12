const config = require("../../config");
const superagent = require("superagent");

module.exports = async (channelID, content, timeout) => {
	if(timeout) await new Promise(resolve => setTimeout(resolve, timeout));

	await superagent.post(`https://discordapp.com/api/channels/${channelID}/messages`)
		.set("Authorization", `Bot ${config.token}`)
		.send(content)
		.catch(err => false); // eslint-disable-line handle-callback-err
};
