const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");

async function addNSFW(channel) {
	let data = await framework.dbQuery(`INSERT INTO \`NSFW\`(\`GUILD\`,\`CHANNEL\`) VALUES ('${channel.guild.id}','${channel.id}')`);
	return true;
}

async function removeNSFW(channel) {
	let data = await framework.dbQuery(`DELETE FROM \`NSFW\` WHERE \`CHANNEL\` = '${channel.id}'`);
	return true;
}

var command = new Command("nsfw", async (message, bot) => {
	let channel = message.channel;
	let nsfw = await framework.isNSFW(channel.id);

	if(nsfw) {
		await removeNSFW(channel);
		return `:white_check_mark: Disabled NSFW in ${channel.mention}`;
	} else {
		await addNSFW(channel);
		return `:white_check_mark: Enabled NSFW in ${channel.mention}`;
	}
}, {
	cooldown: 2500,
	guildOnly: true,
	type: "admin",
	description: "Toggle NSFW commands in the channel the message was sent in"
});
