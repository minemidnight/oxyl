const youtubedl = require("youtube-dl");
module.exports = async link => {
	try {
		let data = await youtubedl.getInfoAsync(link, [], { maxBuffer: Infinity }), format;

		for(let i of data.formats) if(i.format_id === "audio_only") format = i.url;
		if(!format) for(let i of data.formats) if(i.format_id === "medium" || i.format_id === "high") format = i.url;
		if(!format) return "NO_VALID_FORMATS";

		return {
			id: data.uploader,
			live: true,
			service: "twitch",
			stream: format,
			thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${data.uploader.toLowerCase()}-640x360.jpg`,
			title: `${data.description} - ${data.uploader}`
		};
	} catch(err) {
		return "CHANNEL_OFFLINE";
	}
};
const regex = module.exports.regex = /https?:\/\/(?:www\.)?twitch\.tv/;
