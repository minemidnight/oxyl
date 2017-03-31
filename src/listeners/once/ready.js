module.exports = () => {
	let timetook = process.uptime();
	let secs = (timetook % 60).toFixed(2);
	let mins = Math.floor(timetook / 60);
	timetook -= mins * 60;
	timetook = "";
	if(mins > 0) timetook += `${mins}m `;
	if(secs > 0) timetook += `${secs}s`;
	console.log(`Bot from worker ${cluster.worker.id} ready (took ${timetook})`);

	bot.editStatus("online", { name: `o!help | Worker ${cluster.worker.id}` });
};
