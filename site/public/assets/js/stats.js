/* eslint-disable no-undef */
let startTime = parseInt($(".uptime").text());
$(".uptime").text(timespanDifference(startTime));
setInterval(() => {
	$(".uptime").text(timespanDifference(startTime));
}, 1000);

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
