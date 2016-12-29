/* eslint-disable */
$.getJSON("assets/data/stats.json", data => {
	console.log(data);
	let waitTime = Math.random() * 750;
	for(let i = 5; i < 90; i++) {
		setTimeout(() => {
			$(`<style>#progress::after{height:${i}%}</style>`).appendTo("head");
		}, waitTime / 90 * i)
	}

	setTimeout(() => {
		$("#loading").remove();
		$("style").remove();
		$(".w3-quarter").remove();
		$("#stats-display").css("display", "block");
		displayStats(data)
	}, waitTime);
});

function timespanDifference(date, date2 = new Date()) {
	let uptime = date2 - new Date(date);

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
	if(secs > 0) timestr += `${secs}s`;
	return timestr;
}

function displayStats(json) {
	$(".guild").text(json.guildCount);
	$(".user").text(json.userCount);
	$(".channel").text(json.channelCount);
	$(".memory").text(`${json.memory.used} / ${json.memory.total} (${json.memory.percent})`);
	$(".shard").text(json.shardCount);

	$(".uptime").text(timespanDifference(json.startTime));
	setInterval(() => {
		$(".uptime").text(timespanDifference(json.startTime));
	}, 1000)
}
