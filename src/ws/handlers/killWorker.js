/*
{
	op: "killWorker",
	target: 1
}
*/

module.exports = async (client, message) => {
	process.output({ op: "killWorker", target: message.target });
};
