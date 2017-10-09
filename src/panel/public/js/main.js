async function init() {
	await new Promise(r => setTimeout(r, 500));
	console.log("henlo yes");
}

init();
