const router = module.exports = express.Router(); // eslint-disable-line new-cap

router.get("/", async (req, res) => {
	res.status(200).send(`<script>` +
			`document.cookie = "currentToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";` +
			`window.location.href = "${app.config.website.baseURL}"` +
			`</script>`).end();
});
