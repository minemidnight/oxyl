module.exports = {
	process: async message => {
		let invite = `https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot`;
		if(bot.publicConfig.defaultInvitePermissionNumber) {
			invite += `&permissions=${bot.publicConfig.defaultInvitePermissionNumber}`;
		}

		return __("commands.default.invite.success", message, {
			invite,
			server: "https://discord.gg/9wkTDcE"
		});
	},
	description: "Get an invite link for Oxyl and the Support Server"
};
