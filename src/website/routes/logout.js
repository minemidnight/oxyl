const router = module.exports = require("express").Router(); // eslint-disable-line new-cap

router.get("/", async (req, res) => {
	res.status(200).send(`<script>` +
			`document.cookie = "currentToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";` +
			`window.location.href = "${req.app.config.website.baseURL}"` +
			`</script>`).end();
});
