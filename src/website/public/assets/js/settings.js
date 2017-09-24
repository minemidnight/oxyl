/* eslint-disable no-undef */
function setting(action, element) {
	element = $(element);
	element.parent().children().attr("disabled", "");
	let form = element.parent().parent().find("form");

	if(action === "set") {
		let formData = {};
		form.serializeArray().concat(
			form.find("input[type=checkbox]:not(:checked)").map((i, ele) => ({ name: ele.name, value: false })).get()
		).forEach(input => formData[input.name] = input.value);

		$.ajax({
			complete: data => {
				element.parent().children().removeAttr("disabled");
				let resp = JSON.parse(data.responseText);

				let type, text;
				if(resp.success) {
					type = "Success";
					text = "The setting was successfully saved";
				} else if(resp.error) {
					type = "Error";
					text = `Error saving setting: ${resp.error}`;
				} else {
					type = "Unknown";
					text = "No success nor error";
				}

				let id = Date.now();
				$(".notifications").append(`<div id='${id}' style="margin-bottom:-75px"><header>${type}</header>` +
						`<span onclick="removeNotification($(this).parent())">&times;</span><p>${text}</p></div>`);
				setTimeout(() => $(`#${id}`).css("margin-bottom", ""), 1);
				setTimeout(() => removeNotification(`#${id}`), 5000);
			},
			data: formData,
			dataType: "json",
			type: "POST",
			url: window.location.href.replace("dashboard/settings", "update/set")
		});
	} else {
		let name = form.find("[name]").attr("name");
		if(name.startsWith("track")) name = "modLog.track";
		form.find("input:text, input:password, input:file, select, textarea").val("");
		form.find("input:checkbox").removeAttr("checked").removeAttr("selected");

		$.ajax({
			complete: data => {
				element.parent().children().removeAttr("disabled");
				let resp = JSON.parse(data.responseText);

				let type, text;
				if(resp.success) {
					type = "Success";
					text = "The setting was successfully reset";
				} else if(resp.error) {
					type = "Error";
					text = `Error resetting setting: ${resp.error}`;
				} else {
					type = "Unknown";
					text = "No success nor error";
				}


				let id = Date.now();
				$(".notifications").append(`<div id='${id}' style="margin-bottom:-75px"><header>${type}</header>` +
						`<span onclick="removeNotification($(this).parent())">&times;</span><p>${text}</p></div>`);
				setTimeout(() => $(`#${id}`).css("margin-bottom", ""), 1);
				setTimeout(() => removeNotification(`#${id}`), 5000);
			},
			data: { name },
			dataType: "json",
			type: "POST",
			url: window.location.href.replace("dashboard/settings", "update/reset")
		});
	}
}
global.setting = setting;
