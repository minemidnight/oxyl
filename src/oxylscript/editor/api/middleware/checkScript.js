module.exports = () => async (req, res, next, id) => {
	const { r } = req.app.locals;

	const script = await r.table("oxylscript")
		.get(id)
		.default({});

	if(!script.id) {
		res.status(404).json({ error: "Script not found " });
		return false;
	} else if(script.creatorID !== res.locals.user.id) {
		res.status(403).json({ error: "Cannot access script that you do not own" });
		return false;
	} else {
		delete script.creatorID;
		res.locals.script = script;
		return next();
	}
};
