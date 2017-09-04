const channels = require("../../modules/channels.js");
module.exports = async (member, channel) => {
	let channelOwner = await channels.memberFromChannel(channel);
	if(!channelOwner || typeof channelOwner !== "object") return;

	if(!channel.voiceMembers.filter(voiceMember => !voiceMember.bot).length) {
		channel.deleteTimeout = setTimeout(() => channels.delete(channelOwner), 300000);
	}
};
