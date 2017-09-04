const channels = require("../../modules/channels.js");
module.exports = async (member, channel) => {
	let channelOwner = await channels.memberFromChannel(channel);
	if(!channelOwner || typeof channelOwner !== "object" || member.bot) return;

	if(channel.deleteTimeout) {
		clearTimeout(channel.deleteTimeout);
		delete channel.deleteTimeout;
	}
};
