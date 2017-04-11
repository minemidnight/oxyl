const publicConfig = JSON.parse(require("fs").readFileSync("public-config.json").toString());
const StatsD = require("hot-shots");

let client = false;
if(publicConfig.datadog) client = new StatsD(publicConfig.datadog);

module.exports = ({ type, stat, value }) => {
	if(!client) return;
	client[type](stat, value);
};
