const oauth = require("../../oauth/index");
const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

router.get("/", async (req, res) => {
	if(!req.query.code) {
		res.redirect(req.app.locals.oauthURI);
		return;
	}

	try {
		const token = await oauth.token(req.query.code, `${req.app.locals.url}/callback`);
		res.set("Set-Cookie", `token=${JSON.stringify(token).replace(/"/g, `\\"`)}; Max-Age=31,540,000`);

		res.redirect(req.app.locals.url);
	} catch(err) {
		res.redirect(req.app.locals.oauthURI);
	}
});
