module.exports = async (guild, member) => {
	let autoRoles = await r.table("autoRole").getAll(guild.id, { index: "guildID" }).run();
	if(autoRoles.length === 0) return;
	else autoRoles = autoRoles.map(data => data.roleID);

	try {
		await Promise.all(autoRoles.map(roleID => member.addRole(roleID, "Auto role")));
	} catch(err) {} // eslint-disable-line no-empty
};
