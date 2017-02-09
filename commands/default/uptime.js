exports.cmd = new Oxyl.Command("uptime", async message => {
	let uptime = Date.now() - bot.startTime;

	let days = Math.floor(uptime / 1000 / 60 / 60 / 24);
	uptime -= days * 1000 * 60 * 60 * 24;
	let hours = Math.floor(uptime / 1000 / 60 / 60);
	uptime -= hours * 1000 * 60 * 60;
	let mins = Math.floor(uptime / 1000 / 60);
	uptime -= mins * 1000 * 60;
	let secs = Math.floor(uptime / 1000);

	let timestr = "";
	if(days > 0) timestr += `${days}d `;
	if(hours > 0) timestr += `${hours}h `;
	if(mins > 0) timestr += `${mins}m `;
	if(secs > 0) timestr += `${secs}s `;
	return `**Uptime:** ${timestr}`;
}, {
	type: "default",
	description: "View the current uptime of Oxyl"
});
