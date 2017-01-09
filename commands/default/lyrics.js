const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	cheerio = require("cheerio");

var command = new Command("lyrics", (message, bot) => {
	message.channel.sendTyping();
	framework.getContent(`http://search.azlyrics.com/search.php?q=${escape(message.args[0])}`)
	.then(body => {
		let $ = cheerio.load(body); // eslint-disable-line id-length
		let lyricLink = $("div .panel-heading b:contains('Song results:')")
			.parent().next().find("a").eq(0).attr("href"); // eslint-disable-line newline-per-chained-call
		if(!lyricLink) {
			message.channel.createMessage("No songs found");
		} else {
			framework.getContent(lyricLink)
			.then(body2 => {
				$ = cheerio.load(body2);
				let artist = $(".lyricsh h2 b").text();
				artist = artist.substring(0, artist.length - 7).toLowerCase();
				let song = $(".ringtone").next().text();
				song = song.substring(1, song.length - 1);
				let lyrics = $("div.ringtone").siblings("div").eq(4).text(); // eslint-disable-line newline-per-chained-call

				let msg = `**Lyrics for ${framework.capitalizeEveryFirst(artist)} - ${song}**\n${lyrics}`;
				framework.splitParts(msg).forEach(content => {
					message.channel.createMessage(content);
				});
			});
		}
	});
}, {
	cooldown: 2500,
	type: "default",
	description: "Grab lyrics to a song from AZLyrics",
	args: [{
		type: "text",
		label: "song"
	}]
});
