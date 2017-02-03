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
	data.content = converter.makeHtml(data.content);

	let prepend = `<tr><td><div class="w3-container w3-left">`;
	prepend += `<img src="${data.avatar}" class="w3-circle avatar-large" /></div>`;
	prepend += `<div class="w3-container"> <span class="w3-text-white">${data.author}</span>`;
	if(data.bot) prepend += `<span class="bot-tag">BOT</span>`;
	prepend += `<span class="w3-text-blue">#${data.channelname}</span>`;
	prepend += `<span class="w3-text-grey w3-opacity">${time}</span>`;
	if(guildID === "*") prepend += `<a class="w3-right w3-text-black" href="/guild/${data.guildid}">${data.guildname}</a>`;
	prepend += `</div><span style="color:hsla(0,0%,100%,.7)">${data.content}</span></td><tr>`;
	$("#msg-table").prepend(prepend);
};

window.onbeforeunload = () => socket.close();
