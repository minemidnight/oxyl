module.exports = async(timestamp, _a) =>
	new Date(await timestamp.run()).toLocaleString();
	