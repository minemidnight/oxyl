module.exports = {
	async run({ client }) {
		return `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=268494870`;
	}
};
