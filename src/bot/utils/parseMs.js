module.exports = ms => {
	let days = Math.floor(ms / 1000 / 60 / 60 / 24);
	ms -= days * 1000 * 60 * 60 * 24;
	let hours = Math.floor(ms / 1000 / 60 / 60);
	ms -= hours * 1000 * 60 * 60;
	let mins = Math.floor(ms / 1000 / 60);
	ms -= mins * 1000 * 60;
	let secs = Math.floor(ms / 1000);

	let timestr = "";
	if(days > 0) timestr += `${days}d `;
	if(hours > 0) timestr += `${hours}h `;
	if(mins > 0) timestr += `${mins}m `;
	if(secs > 0) timestr += `${secs}s`;
	return timestr.trim();
};
