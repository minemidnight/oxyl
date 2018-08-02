module.exports = {
	async run({ args: [role], guild, member, r, t }) {
		const { roles } = await r.table("roleSettings")
			.get([guild.id, "roleMe"])
			.default({ roles: [] })
			.run();

		if(!role) {
			return t("commands.roleme.list", {
				roles: roles
					.filter(roleID => guild.roles.has(roleID))
					.map(roleID => guild.roles.get(roleID).name)
					.join(", ")
			});
		}

		if(!roles.includes(role.id)) return t("commands.roleme.notAvailable");
		if(member.roles.includes(role.id)) {
			await member.removeRole(role.id);
			return t("commands.roleme.removed", { role: role.name });
		} else {
			await member.addRole(role.id);
			return t("commands.roleme.added", { role: role.name });
		}
	},
	args: [{
		type: "role",
		optional: true
	}]
};
