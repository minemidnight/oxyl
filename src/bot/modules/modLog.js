const recentActions = ["bans"].reduce((a, b) => {
	a[b] = new Map();
	return a;
}, []);

const ban = ({ banned, command, guild, responsible, reason, time }) => {
	if(recentActions.bans.get(`${guild.id}-${banned.id}`)) return;

	recentActions.bans.set(`${guild.id}-${banned.id}`, Date.now());
};

module.exports = { ban };
