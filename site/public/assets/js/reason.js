/* eslint-disable no-undef */

function updateCase(id) {
	let path = window.location.pathname;
	if(path.endsWith("/")) path = path.substring(0, path.length - 1);
	let guildid = path.substring(7, window.location.pathname.lastIndexOf("/"));
	let div = $(`#ban-${id}`);
	let reason = div.find("input").val();
	let btn = div.find("button");
	btn.attr("onclick", "");
	btn.text("Loading...");

	$.ajax({
		type: "POST",
		url: "http://minemidnight.work/guild/set_case",
		data: { guildid: guildid, case: id, reason: reason },
		complete: data => {
			let resp = JSON.parse(data.responseText);
			if(resp.error) {
				$("footer h4").text(resp.error);
				$("footer").display("block");
				setTimeout(() => $("footer").display("none"), 5000);
			} else {
				let modSet = div.find("p").length === 4;
				if(modSet) div.find("p").eq(3).html(`<span>MOD :</span> ${$("#main-nav div a").text().trim()}`);
				else div.find("p").eq(2).after(`<p><span>MOD: </span> ${$("#main-nav div a").text().trim()}</p>`);
				setTimeout(() => {
					btn.attr("onclick", `updateCase(${id})`);
					btn.text("Update");
				}, 2500);
			}
		},
		dataType: "json"
	});
}
