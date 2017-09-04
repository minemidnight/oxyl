const channels = require("../../modules/channels.js");
module.exports = async (member, newChannel, oldChannel) => {
	let channelOwnerNew = await channels.memberFromChannel(newChannel);
	let channelOwnerOld = await channels.memberFromChannel(oldChannel);
	if(channelOwnerNew && typeof channelOwnerNew === "object" && !member.bot) {
		if(newChannel.deleteTimeout) {
			clearTimeout(newChannel.deleteTimeout);
			delete newChannel.deleteTimeout;
		}
	}

	if(channelOwnerOld && typeof channelOwnerOld === "object" &&
		!oldChannel.voiceMembers.filter(voiceMember => !voiceMember.bot).length) {
		oldChannel.deleteTimeout = setTimeout(() => channels.delete(channelOwnerOld), 300000);
	}
};
