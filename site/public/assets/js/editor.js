/* eslint-disable no-undef */
/* eslint-disable consistent-return */

String.prototype.splice = function strSplice(idx, rem, str) {
	return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

$("#editor").on("keypress", (event) => {
	let code = event.keyCode || event.which; console.log(code);
	let value = $("#editor").val();
	let startValue = value, newSelection;

	let start = $("#editor")[0].selectionStart;
	let end = $("#editor")[0].selectionEnd;
	let selection = value.substring(start, end);
	if(start === end) selection = null;

	if(code === 123) {
		if(selection) {
			value = value.splice(start, 0, "{");
			value = value.splice(end, 0, "}");
		} else {
			value = value.splice(start, 0, "{}");
			newSelection = start + 1;
		}
	} else if(code === 13 && value.charAt(start - 1) === ":") {
		let tabCount = 1;

		value = value.splice(start, 0, `\n${repeat("\t", tabCount)}\n`);
		newSelection = start + 1 + tabCount;
	}

	if(startValue !== value) {
		$("#editor").val(value);
		if(newSelection && Array.isArray(newSelection)) {
			$("#editor")[0].selectionStart = newSelection[0];
			$("#editor")[0].selectionEnd = newSelection[1];
		} else if(newSelection) {
			$("#editor")[0].selectionStart = $("#editor")[0].selectionEnd = newSelection;
		}

		return false;
	}
});

$("#editor").keydown((event) => {
	if(event.keyCode !== 9) return;
	let start = $("#editor")[0].selectionStart;
	let end = $("#editor")[0].selectionEnd;
	let value = $("#editor").val();

	$("#editor").val(`${value.substring(0, start)}\t${value.substring(end)}`);
	$("#editor")[0].selectionStart = $("#editor")[0].selectionEnd = start + 1;

	event.preventDefault();
});

$("#editor").numberedtextarea({ allowTabCreator: true });
