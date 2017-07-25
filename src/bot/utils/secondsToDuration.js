module.exports = dur => {
	let hours = Math.floor(dur / 3600);
	let mins = Math.floor(dur % 3600 / 60);
	let secs = Math.floor(dur % 3600 % 60);
	return `${(hours > 0 ? `${hours}:${mins < 10 ? "0" : ""}` : "") + mins}:${secs < 10 ? "0" : ""}${secs}`;
};
