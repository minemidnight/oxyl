const Duration = require("duration-js");
module.exports = {
	process: async message => {
		if(!~message.args[0].indexOf(" in ")) {
			return __("commands.moderator.giveaway.noTime", message);
		}

		let item = message.args[0].substring(0, message.args[0].lastIndexOf("in")).trim();
		let time = message.args[0].substring(message.args[0].lastIndexOf("in") + 2).trim()
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
		}).run();
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
