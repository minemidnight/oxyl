const router = module.exports = require("express").Router(); // eslint-disable-line new-cap
const superagent = require("superagent");

router.get("/", async (req, res) => {
	if(req.query.code) {
		try {
			var { body } = await superagent
				.post("https://discordapp.com/api/oauth2/token")
				.type("form")
				.send({
					client_id: req.app.config.website.botID, // eslint-disable-line camelcase
					client_secret: req.app.config.website.secret, // eslint-disable-line camelcase
					code: req.query.code,
					grant_type: "authorization_code", // eslint-disable-line camelcase
					redirect_uri: `${req.app.config.website.baseURL}/callback` // eslint-disable-line camelcase
				});
		} catch(err) {
			res.redirect(`https://discordapp.com/oauth2/authorize?response_type=code&redirect_uri=` +
					`${req.app.config.website.baseURL}/callback&scope=identify+guilds&client_id=${req.app.config.website.botID}`);
			return;
		}

		let stringified = JSON.stringify({
			token: body.access_token,
			time: Date.now(),
			refresh: body.refresh_token,
			id: Date.now()
		});

		res.status(200).send(`<script>` +
				`document.cookie = "token_${Date.now()}=${stringified.replace(/"/g, `\\"`)};` +
				`expires=Fri, 31 Dec 2020 23:59:59 GMT";` +
				`window.location.href = "${req.app.config.website.baseURL}/accounts"` +
				`</script>`);
	} else if(req.query.timestamp) {
		res.status(200).send(`<script>` +
				`document.cookie = "currentToken=${req.query.timestamp};` +
				`expires=Fri, 31 Dec 2020 23:59:59 GMT";` +
				`window.location.href = "${req.app.config.website.baseURL}"` +
				`</script>`);
	} else {
		res.status(200).redirect(req.app.config.website.baseURL);
	}
	res.end();
});
