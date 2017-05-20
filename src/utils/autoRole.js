module.exports = async (guild, member) => {
	let autoRoles = await r.table("autoRole").filter({ guildID: guild.id }).run();
	if(autoRoles.length === 0) return;
	else autoRoles = autoRoles.map(data => data.roleID);

	try {
		await Promise.all(autoRoles.map(roleID => member.addRole(roleID)));
	} catch(err) {} // eslint-disable-line no-empty
};
