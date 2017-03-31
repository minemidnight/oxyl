const music = Oxyl.modScripts.music;
function shuffle(array) {
	for(let i = array.length; i; i--) {
		let index = Math.floor(Math.random() * i);
		[array[i - 1], array[index]] = [array[index], array[i - 1]];
	}
}

exports.cmd = new Oxyl.Command("shuffle", async message => {
	let manager = music.getManager(message.channel.guild);
	if(!manager) {
		return "There is currently no music playing";
	} else if(!manager.voiceCheck(message.member)) {
		return "You must be listening to music to use this command";
	} else {
		shuffle(manager.data.queue);
		return "Queue shuffled :arrows_counterclockwise:";
	}
}, {
	guildOnly: true,
	type: "music",
	description: "Shuffle the songs in queue"
});
