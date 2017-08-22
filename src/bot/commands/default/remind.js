const Duration = require("duration-js");
module.exports = {
	process: async message => {
		if(!~message.args[0].indexOf(" in ")) {
			return __("commands.default.remind.noTime", message);
		}

		let action = message.args[0].substring(0, message.args[0].lastIndexOf("in")).trim();
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
				return __("commands.default.remind.invalidTime", message);
			}
		} catch(err) {
			return err.message;
		}

		let date = Date.now();
		let dmChannel = message.channel.guild ? await message.author.getDMChannel() : message.channel.id;
		await r.table("timedEvents").insert({
			action,
			createdAt: date,
			channelID: dmChannel.id,
			date: date + duration,
			type: "reminder",
			userID: message.author.id
		}).run();

		return __("commands.default.remind.success", message, { action, time });
	},
	description: "Create a reminder",
	args: [{
		type: "text",
		label: "<action> in <timespan>"
	}]
};
