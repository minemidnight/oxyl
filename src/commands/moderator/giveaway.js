const Duration = require("duration-js");
module.exports = {
	process: async message => {
		if(!~message.args[0].indexOf(" in ")) {
			return "Please provide a time, using this format: `giveaway <item> in <timespan>`";
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
				return "Please only create giveaways for between 30 seconds and 4 weeks into the future.";
			}
		} catch(err) {
			return err.message;
		}

		let date = Date.now();
		let msg = await message.channel.createMessage(`__**GIVEAWAY!**__\n` +
			`React with 🎉 to have a chance to win ${item}\n` +
			`Ending on: ${bot.utils.formatDate(date + duration)}`);
		await msg.addReaction("🎉");

		await r.table("timedEvents").insert({
			channelID: message.channel.id,
			date: date + duration,
			item,
			messageID: msg.id,
			type: "giveaway"
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
