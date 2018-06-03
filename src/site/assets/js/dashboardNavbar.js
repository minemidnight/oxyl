const dashboard = [{
	to: "dashboard",
	name: "General",
	icon: "cog"
}, {
	to: "censors",
	icon: "asterisk"
}, {
	to: "commands",
	icon: "exclamation"
}, {
	to: "modlog",
	name: "Mod-Log",
	icon: "table"
}, {
	to: "music",
	icon: "music"
}, {
	to: "reddit",
	icon: "reddit-alien"
}, {
	to: "roblox",
	icon: "id-card",
	name: "Roblox Verification"
}, {
	to: "roles",
	icon: "plus-circle"
}, {
	to: "twitch",
	icon: "twitch"
}, {
	to: "userlog",
	name: "User Log",
	icon: "users"
}, {
	to: "premium",
	icon: "usd"
}];

dashboard.forEach(page => {
	if(!page.name) page.name = page.to.charAt(0).toUpperCase() + page.to.substring(1);
	if(page.to !== "dashboard") page.to = `dashboard_${page.to}`;
});

module.exports = dashboard;
