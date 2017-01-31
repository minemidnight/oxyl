/* eslint-disable no-undef*/
const socket = new WebSocket("ws://158.69.118.207:3000/", "protocolOne"),
	converter = new showdown.Converter({
		omitExtraWLInCodeBlocks: true,
		simplifiedAutoLink: true,
		strikethrough: true
	});

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

socket.onmessage = (event) => {
	let data = JSON.parse(event.data);
	if(data.guildid !== guildID && guildID !== "*") return;
	let time = getFormattedTime(new Date(parseInt(data.sent)));
	console.log(data.content);
	data.content = converter.makeHtml(data.content);

	let prepend = `<tr><td>${data.author}`;
	if(data.bot) prepend += `<span class="bot-tag">BOT</span>`;
	prepend += `<span class="w3-text-blue">#${data.channelname}`;
	prepend += `</span><span class="w3-text-grey w3-opacity">${time}</span>`;
	if(guildID === "*") prepend += `<a class="w3-right w3-text-black" href="/guild/${data.guildid}">${data.guildname}</a>`;
	prepend += `</td><td>${data.content}</td><tr>`;
	$("#msg-table").prepend(prepend);
};
