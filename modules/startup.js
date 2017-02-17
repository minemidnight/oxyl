bot.once("ready", () => {
	let timetook = Date.now() - startup;
	let mins = Math.floor(timetook / 1000 / 60);
	timetook -= mins * 1000 * 60;
	let secs = Math.floor(timetook / 1000);
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
let startup = Date.now();
