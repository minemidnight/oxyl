const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js"),
	cheerio = require("cheerio");

var command = new Command("rule34", async (message, bot) => {
	message.channel.sendTyping();

	try {
		var body = await framework.getContent(`http://rule34.paheal.net/post/list/${escape(message.args[0])}/1`);
	} catch(err) {
		return "No images found";
	}

	let $ = cheerio.load(body); // eslint-disable-line id-length
	let images = $("div.shm-thumb.thumb br");
	if(images.length === 0) return "No images found";

	for(let i = 0; i < 3; i++) {
		let link = images.eq(i).next().attr("href");
		if(!link) continue;
		let buffer = await framework.getContent(link, { encoding: null });
		message.channel.createMessage("", {
			file: buffer,
			name: link.substring(link.lastIndexOf("/") + 1)
		});
	}
	return false;
}, {
	type: "NSFW",
	description: "Grab 3 images from rule34.paheal.net using a search query",
	args: [{
		type: "text",
		label: "query"
	}]
});
