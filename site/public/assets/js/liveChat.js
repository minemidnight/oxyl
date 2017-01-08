/* eslint-disable no-undef*/
const es = new EventSource("http://minemidnight.work/sse"),
	converter = new showdown.Converter();

function getFormattedTime(date) {
	let hours = date.getHours() === 0 ? "12" : date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
	let minutes = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
	let ampm = date.getHours() < 12 ? "AM" : "PM";
	let formattedTime = `${hours}:${minutes} ${ampm}`;
	return formattedTime;
}

let path = window.location.pathname, guildID;
if(path.startsWith("/guild/")) {
	guildID = path.substring(path.lastIndexOf("/") + 1);
} else {
	guildID = "*";
}

es.onmessage = (event) => {
	let data = JSON.parse(event.data);
	if(!data.content || data.content === "") return;
	if(data.guildid !== guildID && guildID !== "*") return;
	let time = getFormattedTime(new Date(parseInt(data.sent)));

	let prepend = `<tr><td>${data.author} <span class="w3-text-blue">#${data.channelname}`;
	prepend += `</span><span class="w3-text-grey w3-opacity">${time}</span>`;
	if(guildID === "*") prepend += `<span class="w3-right">${data.guildname} (${data.guildid})</span>`;
	prepend += `</td><td>${converter.makeHtml(data.content)}</td><tr>`;
	$("#msg-table").prepend(prepend);
};
