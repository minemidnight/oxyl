module.exports = (next, client) => {
	process.send({ op: "ready" });

	return next();
};
