const babelify = require("express-babelify-middleware"),
	bodyParser = require("body-parser"),
	cookieParser = require("cookie-parser"),
	express = require("express"),
	fs = require("fs"),
	handlebars = require("handlebars"),
	path = require("path"),
	superagent = require("superagent");


Promise.promisifyAll(fs);
const app = express();
const config = app.config = require(path.resolve("config.json"));
const server = app.server = require("http").createServer(app);
server.listen(config.website.port, () => {
	console.startup(`Listening on port ${config.website.port}`);
	cluster.worker.send({ type: "startup", port: config.website.port });
});

app.use(`/assets/js`, babelify(`${__dirname}/public/assets/js`, babelify.browserifySettings, {
	plugins: ["es6-promise"],
	presets: ["es2015"]
}));
app.use(express.static(path.resolve("src", "website", "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
	req.scriptAddition = "";
	next();
});

let raven = require("raven");
if(config.website.sentryLink) raven.config(config.website.sentryLink).install();
require(path.resolve("src", "misc", "rethink"));
require(path.resolve("src", "misc", "outputHandler"));

let routes = loadScripts(path.resolve("src", "website", "routes"));
routes.forEach(script => {
	if(script.name === "index") app.use("/", script.exports);
	else app.use(`/${script.name}`, script.exports);
});

app.page = parseHBS;
async function parseHBS(req, page, context = {}) {
	context.botID = app.config.website.botID;
	context.baseURL = app.config.website.baseURL;
	if(context.guild) {
		context.guild = (await process.output({
			target: context.guild,
			input: `let guild = bot.guilds.get("${context.guild}");` +
				`if(!guild) return "${context.guild}";` +
				`return {` +
					`id: guild.id,` +
					`icon: guild.icon,` +
					`name: guild.name` +
				`}`,
			type: "guild"
		})).result;
	}

	if(req.cookies.currentToken) {
		try {
			req.currentToken = JSON.parse(req.cookies[`token_${req.cookies.currentToken}`]);
		} catch(err) {
			delete req.currentToken;
			req.scriptAddition += `<script>` +
				`document.cookie = "currentToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC"` +
				`</script>`;
		}
	}

	if(req.currentToken) {
		context.user = await app.discordInfo(null, "users/@me", req);
		context.guilds = await app.discordInfo(null, "users/@me/guilds", req);
		if(context.guilds) {
			context.guilds.forEach(guild => {
				let letters = [];
				for(let i = 0; i < guild.name.length; i++) {
					let char = guild.name.charAt(i);
					if(i === 0) letters.push(char);
					else if(char === " ") continue;
					else if(char.match(/[^A-Z0-9]/gi)) letters.push(char);
					else if(guild.name.charAt(i - 1).match(/[^A-Z0-9]/gi)) letters.push(char);
				}

				guild.smallname = letters.join("");
				guild.smallsize = 20 - guild.smallname.length;
				if(guild.smallsize < 12) guild.smallsize = 12;
				guild.admin = !!(guild.permissions & (1 << 3));
				if(context.guild && typeof context.guild === "string" && context.guild === guild.id) context.guild = guild;
				else if(context.guild && context.guild.id === guild.id) context.guild.admin = guild.admin;
			});
		}
	}

	let compiled = handlebars.compile(app.hbs[page] || app.hbs["404"])(context);
	if(req.scriptAddition) compiled += req.scriptAddition;
	return compiled;
}

async function refreshToken(tokenInfo) {
	let data = {
		refresh_token: tokenInfo.refresh, // eslint-disable-line camelcase
		grant_type: "refresh_token" // eslint-disable-line camelcase
	};

	let base64 = new Buffer(`${app.config.website.botID}:${app.config.website.secret}`).toString("base64");
	try {
		let { body } = await superagent
			.post("https://discordapp.com/api/oauth2/token")
			.set("Authorization", `Basic ${base64}`)
			.type("form")
			.send(data);

		return {
			token: body.access_token,
			time: Date.now(),
			refresh: body.refresh_token,
			id: tokenInfo.id
		};
	} catch(err) {
		return false;
	}
}

const infoCache = new Map();
app.discordInfo = async (tokenInfo, apipath, req) => {
	if(!tokenInfo && !req.currentToken) return false;
	else if(!tokenInfo) tokenInfo = req.currentToken;
	if(Date.now() - tokenInfo.time >= 604800) {
		let newToken = await refreshToken(tokenInfo);
		if(newToken === false) {
			req.scriptAddition += `<script>` +
				`document.cookie = "token_${tokenInfo.id}=; expires=Thu, 01 Jan 1970 00:00:00 UTC"` +
				`</script>`;
			if(req.currentToken.id === tokenInfo.id) delete req.currentToken;
			return false;
		} else {
			tokenInfo = newToken;
			req.scriptAddition += `<script>` +
				`document.cookie = "token_${tokenInfo.id}=${JSON.stringify(tokenInfo).replace(/"/g, `\\"`)};` +
				`expires=Fri, 31 Dec 2020 23:59:59 GMT"` +
				`</script>`;
			if(req.currentToken.id === tokenInfo.id) req.currentToken = newToken;
		}
	}

	try {
		if(infoCache.has(`${tokenInfo.token}/${apipath}`)) return infoCache.get(`${tokenInfo.token}/${apipath}`);
		let { body: resp } = await superagent
			.get(`https://discordapp.com/api/${apipath}`)
			.set("Authorization", `Bearer ${tokenInfo.token}`);

		infoCache.set(`${tokenInfo.token}/${apipath}`, resp);
		setTimeout(() => infoCache.delete(`${tokenInfo.token}/${apipath}`), 600000);
		return resp;
	} catch(err) {
		return false;
	}
};

function loadScripts(filepath, deep = false) {
	if(!fs.existsSync(filepath)) return [];

	let scripts = [];
	let files = getFiles(filepath, file => file.endsWith(".js"), deep);

	files.forEach(file => {
		scripts.push({
			exports: require(file),
			name: file.substring(file.lastIndexOf("/") + 1, file.length - 3),
			path: path.parse(file)
		});
	});

	return scripts;
}

function getFiles(filepath, filter = () => true, deep = false) {
	let files = fs.readdirSync(filepath);
	let validFiles = [];

	for(let file of files) {
		if(deep) {
			let stats = fs.lstatSync(`${filepath}/${file}`);
			if(stats.isDirectory()) validFiles = validFiles.concat(getFiles(`${filepath}/${file}`, filter, deep));
		}

		if(filter(file)) validFiles.push(`${filepath}/${file}`);
	}

	return validFiles;
}

handlebars.registerHelper("times", (num, options) => {
	let accum = "";
	for(let i = 1; i <= num; i++)	accum += options.fn({ index: i });
	return accum;
});

handlebars.registerHelper("extendedIf", (v1, operator, v2, options) => {
	if(operator === "=") {
		return v1 === v2 ? options.fn(this) : options.inverse(this);
	} else if(operator === "!=") {
		return v1 !== v2 ? options.fn(this) : options.inverse(this);
	} else if(operator === "includes") {
		return (Array.isArray(v1) || typeof v1 === "string") && ~v1.indexOf(v2) ? options.fn(this) : options.inverse(this);
	} else {
		return options.inverse(this);
	}
});

process.on("unhandledRejection", err => {
	console.error(err.stack);
	if(raven.installed) raven.captureException(err);
});

async function init() {
	app.hbs = {};
	let views = await getFiles(path.resolve("src", "website", "views"));
	for(let i of views) {
		app.hbs[i.substring(i.lastIndexOf("/") + 1, i.lastIndexOf("."))] = await fs.readFileAsync(i, "utf8");
	}
}
init();

cluster.worker.on("message", async msg => {
	if(msg.type === "eval") {
		try {
			let result = await eval(msg.input);
			process.send({ type: "output", result, id: msg.id });
		} catch(err) {
			process.send({ type: "output", error: err.stack, id: msg.id });
		}
	} else if(msg.type === "output") {
		cluster.worker.emit("outputMessage", msg);
	}
});

app.get("*", async (req, res) => {
	res.status(404).send(await app.page(req, "404")).end();
});
