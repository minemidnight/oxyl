module.exports = async (guild, member, type) => {
	let persists = await r.table("rolePersist").filter({ guildID: guild.id, rule: true }).run();
	if(persists.length === 0) return;
	persists = persists.map(data => data.roleID);

	if(type === "leave") {
		if(member.roles.length === 0) return;

		let toPersist = member.roles.filter(roleID => ~persists.indexOf(roleID));
		await r.table("rolePersist").insert({
			guildID: guild.id,
			roles: toPersist,
			memberID: member.id,
			rule: false
		}).run();
	} else if(type === "join") {
		let persistData = await r.table("rolePersist").filter({
			guildID: guild.id,
			memberID: member.id,
			rule: false
		}).run();

		if(persistData.length === 0) return;
		else persistData = persistData[0];

		if(persistData.roles.length === 0) return;
		await r.table("rolePersist").delete(persistData.id).run();
		try {
			// promise.all it so all errors will be handled by the try statement
			await Promise.all(persistData.roles.map(roleID => member.addRole(roleID)));
		} catch(err) {
			return;
		}
	}
};
