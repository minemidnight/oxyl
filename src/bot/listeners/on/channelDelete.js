const channels = require("../../modules/channels.js");
module.exports = async channel => {
	let channelOwner = await channels.memberFromChannel(channel);
	if(!channelOwner || typeof channelOwner !== "object") return;

	channels.delete(channelOwner);
};
