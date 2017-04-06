// provides for kickable and bannable
module.exports = (member, executor) => {
	const guild = member.guild, executorMember = guild.members.get(executor);

	let highestExecutor = executorMember.roles.length >= 1 ?
		executorMember.roles.map(role => guild.roles.get(role)).sort((a, b) => b.position - a.position)[0] :
		guild.roles.get(guild.id);
	let highestMember = member.roles.length >= 1 ?
		member.roles.map(role => guild.roles.get(role)).sort((a, b) => b.position - a.position)[0] :
		guild.roles.get(guild.id);

	if(member.id === guild.ownerID) return false;
	else if(member.id === highestExecutor.id) return false;
	else if(highestExecutor.position === highestMember.position) return highestMember.id - highestExecutor.id > 0;
	else return highestExecutor.position - highestMember.position > 0;
};
