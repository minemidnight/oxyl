const Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js"),
	Command = require("../../modules/commandCreator.js");

async function isBlacklisted(user) {
	let data = await framework.dbQuery(`SELECT * FROM \`Blacklist\` WHERE \`USER\` = '${user}'`);
	if(data && data[0]) return true;
	else return false;
}

async function addBlacklist(user) {
	let data = await framework.dbQuery(`INSERT INTO \`Blacklist\`(\`USER\`) VALUES (${user})`);
	Oxyl.modScripts.commandHandler.blacklist.push(user);
	return true;
}

async function removeBlacklist(user) {
	let data = await framework.dbQuery(`DELETE FROM \`Blacklist\` WHERE \`USER\` = '${user}'`);
	delete Oxyl.modScripts.commandHandler.blacklist[user];
	return true;
}

var command = new Command("blacklist", async (message, bot) => {
	let user = message.args[0];
	let blacklisted = await isBlacklisted(user.id);

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
