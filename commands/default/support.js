const config = framework.config;

exports.cmd = new Oxyl.Command("support", async message => {
	let inviteLink = config.options.inviteLink;
	return `Support Guild: https://discord.gg/9wkTDcE\nInvite Link: ${inviteLink}`;
}, {
	type: "default",
	description: "Get invite link to the support guild, aswell as Oxyl's invite link",
	aliases: ["invite"]
});
