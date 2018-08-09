const getNode = require("../modules/getCommandNode");

module.exports = ({ command }, next, wiggle) => {
	const { r } = wiggle.locals;
	wiggle.locals.messageCounter++;

	if(command) {
		const node = getNode(command, wiggle);
		r.table("commandStats").insert({
			node,
			time: Date.now()
		}).run();
	}

	return next();
};
