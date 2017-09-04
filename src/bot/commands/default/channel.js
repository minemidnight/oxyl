const channels = require("../../modules/channels.js");
module.exports = {
	process: async message => {
		let enabled = await channels.enabled(message.channel.guild.id);
		if(!enabled) return __("commands.default.channel.notEnabled", message);

		let botPerms = message.channel.guild.members.get(bot.user.id).permission;
		if(!botPerms.has("manageChannels")) return __("commands.default.channel.noPerms", message);
		if(message.args[0] === "create") {
			let current = await channels.get(message.member);
			if(current) return __("commands.default.channel.hasChannelAlready", message, { name: current.name });

			let channel = await channels.create(message.member, message.args[1]);
			return __("commands.default.channel.created", message, { name: message.args[1] });
		} else if(message.args[0] === "kick") {
			let current = await channels.get(message.member);
			if(!current) return __("commands.default.channel.needsChannel", message);

			try {
				message.args[1] = await bot.utils.resolver.user(message, message.args[1]);
			} catch(err) {
				return err.message;
			}

			if(!current.voiceMembers.has(message.args[1].id)) return __("commands.default.channel.cantKick", message);
			await bot.editChannelPermission(current.id, message.args[1].id, 0, 1048576, "member");
			let tempChannel = await bot.createChannel(message.channel.guild.id, "VOICEKICK", 2);
			await current.voiceMembers.get(message.args[1].id).edit({ channelID: tempChannel.id });
			await tempChannel.delete();

			return __("commands.default.channel.kicked", message,
				{ user: `${message.args[1].username}#${message.args[1].discriminator}` });
		} else if(message.args[0] === "bitrate") {
			let current = await channels.get(message.member);
			if(!current) return __("commands.default.channel.needsChannel", message);

			try {
				message.args[1] = await bot.utils.resolver.num(message, message.args[1], { min: 8, max: 96 });
			} catch(err) {
				return err.message;
			}

			await current.edit({ bitrate: message.args[1] * 1000 });
			return __("commands.default.channel.changedBitrate", message, { bitrate: message.args[1] });
		} else if(message.args[0] === "userlimit") {
			let current = await channels.get(message.member);
			if(!current) return __("commands.default.channel.needsChannel", message);

			try {
				message.args[1] = await bot.utils.resolver.num(message, message.args[1], { min: 0, max: 99 });
			} catch(err) {
				return err.message;
			}

			await current.edit({ userLimit: message.args[1] });
			return __("commands.default.channel.changedUserLimit", message, { limit: message.args[1] });
		} else if(message.args[0] === "privacy") {
			let current = await channels.get(message.member);
			if(!current) return __("commands.default.channel.needsChannel", message);

			if(message.args[1] === "private") {
				await bot.editChannelPermission(current.id, message.channel.guild.id, 0, 1048576, "role");
				return __("commands.default.channel.nowPrivate", message);
			} else if(message.args[1] === "public") {
				await bot.editChannelPermission(current.id, message.channel.guild.id, 1048576, 0, "role");
				return __("commands.default.channel.nowPublic", message);
			} else {
				return __("commands.default.channel.invalidPrivacy", message);
			}
		} else if(message.args[0] === "whitelist" || message.args[0] === "wl") {
			let current = await channels.get(message.member);
			if(!current) return __("commands.default.channel.needsChannel", message);

			try {
				message.args[1] = await bot.utils.resolver.user(message, message.args[1]);
			} catch(err) {
				return err.message;
			}

			await bot.editChannelPermission(current.id, message.args[1].id, 1048576, 0, "member")
				.catch(err => {}); // eslint-disable-line
			return __("commands.default.channel.whitelisted", message,
				{ user: `${message.args[1].username}#${message.args[1].discriminator}` });
		} else {
			return __("commands.default.channel.invalidSubcommand", message);
		}
	},
	guildOnly: true,
	description: "Have users create their own channels, with options to make it private, kick users, and more",
	args: [{
		type: "text",
		label: "create|kick|bitrate|userlimit|privacy|whitelist"
	}, {
		type: "text",
		label: "name|user|number|private/public|user"
	}]
};
