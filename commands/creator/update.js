const Oxyl = require("../../oxyl.js"),
	framework = require("../../framework.js"),
	Command = require("../../modules/commandCreator.js"),
	fs = require("fs"),
	path = require("path"),
	yaml = require("js-yaml");

function copyFileSync(source, target) {
	let targetFile = target;

	if(fs.existsSync(target) && fs.lstatSync(target).isDirectory()) targetFile = path.join(target, path.basename(source));
	fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
	let files = [];

	let targetFolder = path.join(target, path.basename(source));
	if(!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder);

	if(fs.lstatSync(source).isDirectory()) {
		files = fs.readdirSync(source);
		files.forEach((file) => {
			var curSource = path.join(source, file);
			if(fs.lstatSync(curSource).isDirectory()) copyFolderRecursiveSync(curSource, targetFolder);
			else copyFileSync(curSource, targetFolder);
		});
	}
}

var command = new Command("update", (message, bot) => {
	let version = Oxyl.version;
	let newVersion = yaml.safeLoad(fs.readFileSync("./../oxyl-beta/private/config.yml")).version;
	if(parseInt(newVersion.replace(/./g, "")) <= parseInt(version.replace(/./g, ""))) {
		return `Oxyl is already up to date`;
	} else {
		fs.rmdir("./", err => {
			if(err) throw err;
			copyFolderRecursiveSync("./../oxyl-beta", "./");
		});

		setTimeout(() => {
			message.channel.createMessage(`Oxyl has been updated from ${version} to ${newVersion}`);
			process.exit(0);
		}, 3500);
		return `Updating Oxyl to ${newVersion}`;
	}
}, {
	type: "creator",
	description: "Update Oxyl from Oxyl Beta"
});
