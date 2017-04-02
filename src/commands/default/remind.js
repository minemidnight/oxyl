const Duration = require("duration-js");
module.exports = {
	process: async message => {
		if(!~message.args[0].indexOf(" in ")) {
			return "Please provide a time, using this format: `remind <action> in <timespan>`";
		}

		let split = message.args[0].split(" in ");
		let action = split[0].trim();
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
				return "Please only create reminders for between 30 seconds and 4 weeks into the future.";
			}
		} catch(err) {
			return err.message;
		}

		let date = Date.now();
		let dmChannel = message.channel.guild ? await message.author.getDMChannel() : message.channel.id;
		await r.table("timedEvents").insert({
			createdAt: date,
			channel: dmChannel.id,
			date: date + duration,
			message: action,
			type: "reminder"
		});
		return `Successfully created reminder: \`${action}\` in ${time}`;
	},
	description: "Create a reminder",
	args: [{
		type: "text",
		label: "<action> in <timespan>"
	}]
};
