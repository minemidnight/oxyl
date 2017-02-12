function updateCase(id) {
	var path = window.location.pathname;
	if(path.endsWith("/")) path = path.substring(0, path.length - 1);
	guild = path.substring(7, window.location.pathname.lastIndexOf("/"));
	reason = $(`#ban-1 input`).val();
	console.log(guild + " - " + id + " - " + reason);
	$.ajax({
		type: "POST",
		url: "http://minemidnight.work/guild/set_case",
		data: { guildid: guild, case: id, reason: reason},
		dataType: "json"
	});
}
