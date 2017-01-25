const Oxyl = require("../../oxyl.js"),
	Command = require("../../modules/commandCreator.js"),
	framework = require("../../framework.js");
const key = framework.config.private.ibsearch;

var command = new Command("ibsearch", async (message, bot) => {
	message.channel.sendTyping();
	let url;
	if(!message.args[0]) url = `https://ibsearch.xxx/api/v1/images.json?key=${key}&q=random:`;
	else url = `https://ibsearch.xxx/api/v1/images.json?key=${key}&q=${message.args[0]}`;

	let body = await framework.getContent(url);
	body = JSON.parse(body);
	if(body.length === 0) return "No results found";
	body = body.filter(data => data.rating === "q" || data.rating === "e");
	for(let i = 0; i < 3; i++) {
		let data = body[i];
		if(!data) continue;
		let buffer = await framework.getContent(`https://${data.server}.ibsearch.xxx/${data.path}`, { encoding: null });
		message.channel.createMessage("", {
			file: buffer,
			name: `${data.id}.${data.format}`
		});
	}

	return false;
}, {
	type: "NSFW",
	description: "Grab 3 images from ibsearch.xxx using a search query, or randomly",
	args: [{
		type: "text",
		label: "query",
		optional: true
	}]
});
