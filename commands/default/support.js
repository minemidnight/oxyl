const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const config = framework.config;

var command = new Command("support", () => `Support Guild: https://discord.gg/KtyNPcE\nInvite Link: ${config.options.inviteLink}`, {
	type: "default",
	description: "Get invite link to the support guild, aswell as Oxyl's invite link",
	aliases: ["invite"]
});
