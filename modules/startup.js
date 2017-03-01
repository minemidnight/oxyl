bot.once("ready", () => {
	let timetook = process.uptime();
	Oxyl.statsd.timing(`oxyl.starttime`, timetook * 1000);
	let secs = (timetook % 60).toFixed(2);
	let mins = Math.floor(timetook / 60);
	timetook -= mins * 60;
	timetook = "";
	if(mins > 0) timetook += `${mins}m `;
	if(secs > 0) timetook += `${secs}s`;
	framework.consoleLog(`Bot Ready (startup took ${timetook})`);

	bot.editStatus("online", { name: "oxyl help" });
	Oxyl.postStats();

	Oxyl.modScripts.commandHandler.updateThings();
	setTimeout(() => Oxyl.modScripts.music.isReady(), 7500);
});

bot.connect();
