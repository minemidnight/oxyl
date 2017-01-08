/* eslint-disable */
function toggleNav() {
	$("#main-nav").css("display", (index, currentValue) => {
		if(currentValue === "block") return "none";
		else if(currentValue === "none") return "block";
	});

	$(".w3-overlay").css("display", $("#main-nav").css("display"));
}

function toggleAccordion(selector) {
	$(selector).next().toggleClass("w3-show");
}
