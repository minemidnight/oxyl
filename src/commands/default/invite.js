module.exports = {
	process: async message => {
		let invite = `https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot`;
		if(bot.publicConfig.defaultInvitePermissionNumber) {
			invite += `&permissions=${bot.publicConfig.defaultInvitePermissionNumber}`;
		}
		return `Support Server: https://discord.gg/9wkTDcE\nInvite: ${invite}`;
	},
	description: "Get an invite link for Oxyl and the Support Server"
};
