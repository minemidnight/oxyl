const modLog = require("../../modules/modLog.js");
module.exports = async (guild, user) => {
	modLog.create(guild, "unban", user);
};
