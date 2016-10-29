const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js"),
      https = require("https"),
      googl = require("goo.gl");
const config = Oxyl.config;
googl.setKey(config["googleKey"]);

Oxyl.registerCommand("shorten", "default", (message, bot) => {
  var filter = "^((https|http|ftp|rtsp|mms)?://)"
    + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
    + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
    + "|" // 允许IP和DOMAIN（域名）
    + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
    + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
    + "[a-z]{2,6})" // first level domain- .com or .museum
    + "(:[0-9]{1,4})?" // 端口- :80
    + "((/?)|" // a slash isn't required if there is no file name
    + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
  var filter = new RegExp(filter);
  if (!message.content) {
    return "please provide a link to shorten";
  } else if (!filter.test(message.content)) {
    return "please provide a valid link"
  } else {
    googl.shorten(message.content, {quotaUser: message.author.id})
      .then((shortUrl) => {
          return `shortened link: ${shortUrl}`;
      })
  }
}, ["shortenlink", "googl", "shortlink"], "Shorten a link using goo.gl", "<link>");
