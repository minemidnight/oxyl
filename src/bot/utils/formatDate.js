const months = ["January", "February", "March", "April", "May", "June", "July",
	"August", "September", "October", "November", "December"];
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

module.exports = (toFormat) => {
	let date = new Date(toFormat);

	let month = months[date.getMonth()];
	let day = date.getDate();
	let weekday = weekdays[date.getDay()];
	let hour = date.getHours();
	let min = date.getMinutes();
	let sec = date.getSeconds();
	let year = date.getFullYear();

	day = (day < 10 ? "0" : "") + day;
	hour = (hour < 10 ? "0" : "") + hour;
	min = (min < 10 ? "0" : "") + min;
	sec = (sec < 10 ? "0" : "") + sec;

	return `${weekday.substring(0, 3)}, ${month.substring(0, 3)} ${day} ${year}, ${hour}:${min}:${sec}`;
};
