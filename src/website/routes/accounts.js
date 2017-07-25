const router = module.exports = express.Router(); // eslint-disable-line new-cap

router.get("/", async (req, res) => {
	let accounts = [];
	for(let key in req.cookies) {
		if(!key.startsWith("token_")) continue;
		try {
			let cookie = JSON.parse(req.cookies[key]);
			let info = await app.discordInfo(cookie, "users/@me", req);
			if(!info) continue;
			info.tokenid = cookie.id;

			accounts.push(info);
		} catch(err) {
			continue;
		}
	}

	res.status(200).send(await app.page(req, "accounts", { accounts })).end();
});
