const Discord = require("discord.js"),
	Oxyl = require("../oxyl.js"),
	https = require("https"),
	googl = require("goo.gl");
const config = Oxyl.config;
googl.setKey(config.googleKey);

Oxyl.registerCommand("shorten", "default", (message, bot) => {
	var filter = `${"^((https|http|ftp|rtsp|mms)?://)" +
    "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" +
    "(([0-9]{1,3}\\.){3}[0-9]{1,3}" +
    "|" +
    "([0-9a-z_!~*'()-]+\\.)*" +
    "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\\." +
    "[a-z]{2,6})" +
    "(:[0-9]{1,4})?"}${+"((/?)|"
    }(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$`;
	filter = new RegExp(filter);
	if(!message.content) {
		return "please provide a link to shorten";
	} else if(!filter.test(message.content)) {
		return "please provide a valid link";
	} else {
		googl.shorten(message.content, { quotaUser: message.author.id })
    .then((shortUrl) => message.reply(`shortened link: ${shortUrl}`) );
		return false;
	}
}, ["shortenlink", "googl", "shortlink"], "Shorten a link using goo.gl", "<link>");
