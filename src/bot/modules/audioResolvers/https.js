const youtubedl = Promise.promisifyAll(require("youtube-dl"));
module.exports = async link => {
	try {
		let data = await youtubedl.getInfoAsync(link, [], { maxBuffer: Infinity });

		return {
			service: "https",
			stream: data.url,
			title: data.title || "HTTPS Stream"
		};
	} catch(err) {
		return "INVALID_URL";
	}
};
const regex = module.exports.regex = /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
