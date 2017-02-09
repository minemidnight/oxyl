bot.once("ready", () => {
	framework.consoleLog("Bot ready");
	bot.editStatus("online", { name: "oxyl help" });
	Oxyl.postStats();

	Oxyl.modScripts.commandHandler.updateThings();
	setTimeout(() => Oxyl.modScripts.music.isReady(), 7500);
});

bot.connect();
