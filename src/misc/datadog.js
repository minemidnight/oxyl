const config = require("config.json");
const StatsD = require("hot-shots");

let client = false;
if(config.datadog) client = new StatsD(config.other.datadog);

module.exports = ({ type, stat, value }) => {
	if(!client) return;
	client[type](stat, value);
};
