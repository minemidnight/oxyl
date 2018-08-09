/*
{
	op: "restartWorker",
	target: 1
}
*/

module.exports = async (client, message) => {
	process.output({ op: "restartWorker", target: message.target });
};
