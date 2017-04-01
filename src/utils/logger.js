const chalk = require("chalk");
module.exports = {
	startup: (info) => console.log(`${chalk.black.bgGreen("STARTUP")} ${chalk.green(info)}`),
	error: (info) => console.log(`${chalk.bgRed("ERROR")} ${chalk.red(info)}`),
	warn: (info) => console.log(`${chalk.black.bgYellow("WARN")} ${chalk.yellow(info)}`),
	info: (info) => console.log(`${chalk.bgBlue("INFO")} ${chalk.magenta(info)}`)
};

Object.keys(module.exports).forEach(i => console[i] = module.exports[i]);
