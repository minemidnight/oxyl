const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const config = framework.config;

var command = new Command("support", async (message, bot) => {
	let inviteLink = config.options.inviteLink;
	return `Support Guild: https://discord.gg/9wkTDcE\nInvite Link: ${inviteLink}`;
}, {
	type: "default",
	description: "Get invite link to the support guild, aswell as Oxyl's invite link",
	aliases: ["invite"]
});
