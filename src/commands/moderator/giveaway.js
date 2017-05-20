const Duration = require("duration-js");
module.exports = {
	process: async message => {
		if(!~message.args[0].indexOf(" in ")) {
			return __("commands.moderator.giveaway.noTime", message);
		}

		let split = message.args[0].split(" in ");
		let item = split[0].trim();
		let time = split[1].trim()
			.replace(/weeks?/g, "w")
			.replace(/days?/g, "d")
			.replace(/hours?/g, "h")
			.replace(/minutes?/g, "m")
			.replace(/seconds?/g, "s")
			.replace(/milliseconds?/g, "ms")
			.replace(/ /g, "");

		try {
			var duration = new Duration(time);
			duration = duration.milliseconds();
			if(duration < 30000 || duration > 2419200000) {
				return __("commands.moderator.giveaway.invalidTime", message);
			}
		} catch(err) {
			return err.message;
		}

		let date = Date.now();
		let msg = await message.channel.createMessage(__("commands.moderator.giveaway.message", message, {
			item,
			date: bot.utils.formatDate(date + duration)
		}));
		await msg.addReaction("🎉");

		await r.table("timedEvents").insert({
			channelID: message.channel.id,
			date: date + duration,
			item,
			messageID: msg.id,
			type: "giveaway",
			guildID: message.channel.guild.id
		});
		return false;
	},
	guildOnly: true,
	perm: "manageChannels",
	description: "Create a giveaway",
	args: [{
		type: "text",
		label: "<item> in <timespan>"
	}]
};
