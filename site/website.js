const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js"),
	express = require("express"),
	handlebars = require("handlebars"),
	fs = require("fs");

const app = express();
const codes = [];
app.use(express.static("./site/public"));

function getInfo(code, api) {
	let url = `https://discordapp.com/api/${api}`;
	console.log(url);
	return framework.getContent(url, {
		method: "GET",
		headers: { Authorization: `Bearer ${code}` }
	}).then(console.log).catch(console.log);
}

function getIp(request) {
	return request.headers["x-forwarded-for"] || request.connection.remoteAddress;
}

function parseHB(hb, context) {
	let hbst = fs.readFileSync(`./site/hb/${hb}.hbs`).toString();
	let hbs = handlebars.compile(hbst);
	return hbs(context);
}

app.get("/test", (req, res) => {
	let ip = getIp(req);
	codes.ip = req.query.code;
	console.log("/test", ip);

	if(!codes[ip]) {
		res.send("No code");
	} else {
		getInfo(codes[ip], "users/@me");
		res.send(`Your code is ${codes[ip]}`);
	}
});

app.get("/login", (req, res) => {
	let ip = getIp(req);
	codes[ip] = req.query.code;
	console.log("/login", ip);

	res.redirect("http://minemidnight.work");
});

app.listen(8080, () => console.log("Listening on port 8080"));
