exports.cmd = new Oxyl.Command("youtube", async message => {
	message.channel.sendTyping();

	let video = await Oxyl.modScripts.music.providers.searchVideo(message.argsPreserved[0], message.channel.guild ? message.channel.guild.shard.id : 0);
	if(video === "NO_RESULTS") return "No results found";
	else return `http://youtube.com/watch?v=${video}`;
}, {
	type: "default",
	aliases: ["yt"],
	description: "Search a youtube query",
	args: [{
		type: "text",
		label: "query"
	}]
});
