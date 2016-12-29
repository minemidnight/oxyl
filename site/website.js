const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js"),
	express = require("express"),
	handlebars = require("handlebars"),
	fs = require("fs");

const app = express();
app.use(express.static("./site/public"));

function parseHB(hb, context) {
	let hbst = fs.readFileSync(hb).toString();
	let hbs = handlebars.compile(hbst);
	return hbs(context);
}

app.get("/ip", (req, res) => {
	let ip = req.ip;
	let page = parseHB('./site/hb/ip.hbs', { ip });
	res.send(page);
});

app.listen(80);
