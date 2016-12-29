const Oxyl = require("../oxyl.js"),
	framework = require("../framework.js"),
	fs = require("fs"),
	cheerio = require("cheerio");

const construct = fs.readdirSync("./site/fill-html");
construct.forEach(file => {
	getNewHTML(file).then(newContent => {
		fs.writeFile(`./site/public/${file}`, newContent);
	});
});

function getNewHTML(file) {
	let fileName = file.substring(0, file.lastIndexOf("."));
	return new Promise((resolve, reject) => {
		fs.readFile(`./site/fill-html/${file}`, (err, data) => {
			if(err) throw err;
			if(!createHTML[fileName]) resolve(data);
			else resolve(createHTML[fileName](cheerio.load(data)));
		});
	});
}

const createHTML = {
	commands: ($) => { // eslint-disable-line id-length
		let container = $("#fill-commands");

		for(let cmdType in commands) {
			let id = cmdType.replace(/ /g, "-");
			let capitalized = framework.capitalizeEveryFirst(cmdType);
			let append = `<div class="w3-accordion">` +
				`<button onclick="toggleAccordion('#${id}')" class="w3-blue-grey w3-btn-block w3-left-align">` +
				`${capitalized} Commands</button>` +
				`<div class="w3-accordion-content w3-responsive w3-animate-zoom" id="${id}"><table class="w3-table w3-bordered w3-hoverable">` +
				`<tr class="w3-hover-notquiteblack"><th>Usage</th><th>Description</th><th>Aliases</th></tr>`;
			for(let cmd in commands[cmdType]) {
				cmd = commands[cmdType][cmd];
				append += `<tr class="w3-hover-notquiteblack"><td>${cmd.name} ${cmd.usage !== "[]" ? cmd.usage : ""}</td>` +
									`<td>${cmd.description}</td>` +
									`<td>${cmd.aliases.length > 0 ? cmd.aliases.join(", ") : "N/A"}</td></tr>`;
			}

			container.append(`${append}</table></div></div>`);
		}

		return $.html();
	},
	tags: ($) => { // eslint-disable-line id-length
		let table = $("#tag-table");

		for(let i of tags.sorted) {
			let tag = tags.info[i];
			let input = `${tag.in ? tag.in.startsWith("@%") ? tag.in.substring(2) : `{${i}:${tag.in}}` : `{${i}}`}`;
			table.append(`<tr class="w3-hover-notquiteblack"><td>${i}</td><td>` +
									`${tag.usage ? tag.usage.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "[ ]"}` +
									`</td><td>${tag.return}</td><td>${input}</td><td>${tag.out}</td></tr>`);
		}

		return $.html();
	}
};

const commands = Oxyl.commands;
const tags = require("../commands/default/tags.js");
