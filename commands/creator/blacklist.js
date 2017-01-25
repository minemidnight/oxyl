const Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js"),
	Command = require("../../modules/commandCreator.js");

async function addBlacklist(user) {
	let data = await framework.dbQuery(`INSERT INTO \`Blacklist\`(\`USER\`) VALUES ('${user}')`);
	Oxyl.bot.users.get(user).blacklisted = true;
	return true;
}

async function removeBlacklist(user) {
	let data = await framework.dbQuery(`DELETE FROM \`Blacklist\` WHERE \`USER\` = '${user}'`);
	delete Oxyl.bot.users.get(user).blacklisted;
	return true;
}

var command = new Command("blacklist", async (message, bot) => {
	let user = message.args[0];
	let blacklisted = user.blacklisted;

	if(blacklisted) {
		await removeBlacklist(user.id);
		return `:white_check_mark: Removed ${framework.unmention(user)} from the blacklist`;
	} else {
		await addBlacklist(user.id);
		return `:white_check_mark: Added ${framework.unmention(user)} to the blacklist`;
	}
}, {
	type: "creator",
	description: "Blacklist someone from using the bot",
	args: [{ type: "user" }]
});
