const commands = require("../../modules/commands.js");
module.exports = message => {
	if(message.author.bot) return;
	else commands(message);
};
