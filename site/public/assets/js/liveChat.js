/* eslint-disable no-undef*/
const socket = new WebSocket("ws://158.69.118.207:3000/"),
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

let settings = {
	paused: false,
	startsWith: "",
	endsWith: "",
	matches: "",
	flags: "",
	channels: []
};

$("#pause-play").click(() => {
	settings.paused = !settings.paused;
	$("#pause-play").html(`${settings.paused ? "play" : "pause"}_circle_outline`);
});

let cancelData = [];
function saveData() {
	cancelData = [];
	$("form input").each((i, ele) => {
		ele = $(ele);
		if(ele.attr("type") === "checkbox") {
			if(ele.is(':checked')) cancelData.push(true);
			else cancelData.push(false);
		} else {
			cancelData.push(ele.value || "");
		}
	});
}

$("#modal-settings").click(() => {
	saveData();
});

function cancelModal() {
	$("form input").each((i, ele) => {
		ele = $(ele);
		if(ele.attr("type") === "checkbox") {
			if(cancelData[i] !== ele.is(':checked')) ele.click();
		} else {
			ele.val(cancelData[i]);
		}
	});

	cancelData = [];
	toggleModal("settings-modal");
}

$("#save-modal").click(() => {
	let form = $("form");
	settings.startsWith = form.find(`input[name="starts"]`).val() || "";
	settings.endsWith = form.find(`input[name="ends"]`).val() || "";
	settings.matches = form.find(`input[name="matches"]`).val() || "";

	settings.flags = "";
	form.find(`input[name="flags"]:checked`).each((i, ele) => {
		settings.flags += ele.value;
	});

	settings.channels = [];
	$("form").find(`input[name="channels"]:checked`).each((i, ele) => settings.channels.push(ele.value));
	saveData();
});

$("#restore-modal").click(() => {
	settings.startsWith = "";
	settings.endsWith = "";
	settings.matches = "";
	settings.flags = "";
	settings.channels = [];

	$("form").trigger("reset");
	saveData();
});

socket.onmessage = (event) => {
	let data = JSON.parse(event.data);
	if(settings.paused) return;
	else if(settings.startsWith.length > 0 && !data.content.startsWith(settings.startsWith)) return;
	else if(settings.endsWith.length > 0 && !data.content.endsWith(settings.endsWith)) return;
	else if(settings.matches.length > 0 && !data.content.match(new RegExp(settings.matches, settings.flags))) return;
	else if(settings.channels.length > 0 && !settings.channels.includes(data.channelid)) return;

	if(data.guildid !== guildID && guildID !== "*") return;
	let time = getFormattedTime(new Date(parseInt(data.sent)));
	data.content = converter.makeHtml(data.content);

	let prepend = `<tr><td><div class="w3-row">`;
	prepend += `<div style="width:50px;float:left;margin-right:7.5px"><img src="${data.avatar}?size=256" class="w3-circle avatar-large" /></div>`;
	prepend += `<div class="w3-rest"><span class="w3-text-white">${data.author}</span>`;
	if(data.bot) prepend += `<span class="bot-tag">BOT</span>`;
	prepend += `<span class="w3-text-blue">#${data.channelname}</span>`;
	prepend += `<span class="w3-text-grey w3-opacity">${time}</span>`;
	if(guildID === "*") prepend += `<a class="w3-right w3-text-black" href="/guild/${data.guildid}">${data.guildname}</a>`;
	prepend += `<span style="color:hsla(0,0%,100%,.7)" class="content">${data.content}</span>`;
	prepend += `</div></div></td><tr>`;
	$("#msg-table").prepend(prepend);
};

window.onbeforeunload = () => socket.close();
