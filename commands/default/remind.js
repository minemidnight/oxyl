const Duration = require("duration-js");
const sqlQueries = Oxyl.modScripts.sqlQueries;

exports.cmd = new Oxyl.Command("remind", async message => {
	if(!message.args[0].includes(" in ")) return "Please provide a time, using this format: `remind <action> in <timespan>`";
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
		if(duration < 30000 || duration > 2419200000) return "Please only create reminders for between 30 seconds and 4 weeks into the future.";
	} catch(err) {
		return err.message;
	}

	let date = Date.now();
	await sqlQueries.dbQuery(`INSERT INTO Reminders(USER, MESSAGE, DATE, CREATED) ` +
		`VALUES ("${message.author.id}", "${action}", ${date + duration}, ${date})`);
	return `:white_check_mark: Successfully created a reminder to \`${action}\` in ${time}`;
}, {
	type: "default",
	cooldown: 5000,
	description: "Create a reminder to remind you to do something",
	args: [{
		type: "text",
		label: "<action> in <timespan>"
	}]
});
