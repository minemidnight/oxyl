module.exports = {
	async run({ args: [role], guild, message: { member }, wiggle: { locals: { r } }, t }) {
		const { roles } = await r.table("roleSettings").get([guild.id, "roleMe"]).default({ roles: [] }).run();

		if(!role) {
			return t("commands.roleme.list", {
				roles: roles
					.filter(roleID => guild.roles.has(roleID))
					.map(roleID => guild.roles.get(roleID).name)
					.join(", ")
			});
		}

		if(!~roles.indexOf(role.id)) return t("commands.roleme.notAvailable");
		if(~member.roles.indexOf(role.id)) {
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
