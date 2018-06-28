const oxylscript = require("./index");

const author = {
	id: "123",
	username: "jeff",
	discriminator: "5812"
};

const member = Object.assign({}, author, {
	game: { name: "e" },
	status: "idle",
	user: author
});

const channel = {
	name: "general",
	id: "1234",
	createMessage: console.log
};

const role = {
	name: "@everyone",
	hoist: false,
	id: "1234"
};

const guild = {
	channels: new Map().set(channel.id, channel),
	members: new Map().set(member.id, member),
	roles: new Map().set(role.id, role),
	name: ";)",
	id: "3456"
};

role.guild = guild;
channel.guild = guild;

const message = {
	cleanContent: "@jeff hi",
	content: "<@1212412> hi",
	id: "1234",
	author,
	channel
};

const fs = require("fs");
const path = require("path");

const code = fs.readFileSync(path.resolve(__dirname, "code.ox"), "utf8");

console.time("total");
console.time("match");
const match = oxylscript.match(code);
console.timeEnd("match");

if(match.succeeded()) {
	console.time("execute");
	oxylscript.execute(match, message);
	console.timeEnd("execute");
} else {
	console.error("Errored:", match.message);
}

console.timeEnd("total");
