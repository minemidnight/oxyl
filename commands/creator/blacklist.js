async function addBlacklist(user) {
	let data = await framework.dbQuery(`INSERT INTO \`Blacklist\`(\`USER\`) VALUES ('${user}')`);
	Oxyl.modScripts.commandHandler.blacklist.push(user);
	return true;
}

async function removeBlacklist(user) {
	let data = await framework.dbQuery(`DELETE FROM \`Blacklist\` WHERE \`USER\` = '${user}'`);
	delete Oxyl.modScripts.commandHandler.blacklist[user];
	return true;
}

exports.cmd = new Oxyl.Command("blacklist", async message => {
	let user = message.args[0];
	let blacklisted = Oxyl.modScripts.commandHandler.blacklist.indexOf(user) !== -1;

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
