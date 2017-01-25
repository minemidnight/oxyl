const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	cheerio = require("cheerio");

var command = new Command("pornhub", async (message, bot) => {
	message.channel.sendTyping();

	let url;
	if(!message.args[0]) url = "http://pornhub.com";
	else url = `http://www.pornhub.com/video/search?search=${escape(message.args[0])}`;
	let body = await framework.getContent(url);

	let $ = cheerio.load(body); // eslint-disable-line id-length
	if($("#noResultBigText").text() !== "") return "No results found";
	let videos = $("li.videoBox");

	for(let i = 0; i < 3; i++) {
		let ele = videos.eq(i);

		let buffer = await framework.getContent(ele.find("img").attr("data-mediabook"), { encoding: null });

		let thumbsup = ele.find(".rating-container.up div.value").text();
		if(!thumbsup) thumbsup = 100 - parseInt(ele.find(".rating-container.down").text());
		let content = `**Title:** ${ele.find(".title").text().trim()}` +
			`\n**Link:** <http://www.pornhub.com${ele.find(".title a").attr("href")}>` +
			`\n**Duration:** ${ele.find(".duration").text()}` +
			`\n**Views:** ${ele.find(".views var").text()}` +
			`\n**Added:** ${ele.find(".added").text()}` +
			`\n${thumbsup}% :thumbs_up: **|** ${100 - parseInt(thumbsup)}% :thumbs_down:`;

		message.channel.createMessage(content, {
			file: buffer,
			name: `porn.webm`
		});
	}

	return false;
}, {
	type: "NSFW",
	disabled: true,
	description: "Grab the top 3 videos from pornhub.com, or search for videos",
	args: [{
		type: "text",
		label: "query",
		optional: true
	}]
});
