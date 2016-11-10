const Discord = require("discord.js"),
	Oxyl = require("../../oxyl.js");

Oxyl.registerCommand("support", "default", (message) =>
   "Support Guild: https://discord.gg/KtyNPcE" +
  "\nInvite Link: https://goo.gl/9tHfuB"
, ["invite"], "Get invite link to the support guild, aswell as Oxyl's invite link", "[]");
