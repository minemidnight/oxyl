async function addBlacklist(uid) {
	let data = await framework.dbQuery(`INSERT INTO \`Blacklist\`(\`USER\`) VALUES ('${uid}')`);
	Oxyl.modScripts.commandHandler.blacklist.push(uid);
	return true;
}

async function removeBlacklist(uid) {
	let data = await framework.dbQuery(`DELETE FROM \`Blacklist\` WHERE \`USER\` = '${uid}'`);
	delete Oxyl.modScripts.commandHandler.blacklist[Oxyl.modScripts.commandHandler.blacklist.indexOf(uid)];
	return true;
}

exports.cmd = new Oxyl.Command("blacklist", async message => {
	let user = message.args[0];
	let blacklisted = Oxyl.modScripts.commandHandler.blacklist.indexOf(user.id) !== -1;

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
