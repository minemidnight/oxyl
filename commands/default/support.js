exports.cmd = new Oxyl.Command("support", async message => `Support Guild: https://discord.gg/9wkTDcE\nInvite Link: ${framework.config.inviteLink}`, {
	type: "default",
	description: "Get invite link to the support guild, aswell as Oxyl's invite link",
	aliases: ["invite"]
});
