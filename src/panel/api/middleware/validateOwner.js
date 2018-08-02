const config = require("../../../../config");

module.exports = () => async (req, res, next) => {
	if(!config.owners.includes(res.locals.user.id)) {
		return res.status(403).json({ error: "Not an owner" });
	} else {
		return next();
	}
};
