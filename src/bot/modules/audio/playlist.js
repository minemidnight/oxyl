const superagent = require("superagent");
module.exports = async id => {
	var { body } = await superagent.get(`https://www.youtube.com/list_ajax`)
		.query({
			style: "json",
			action_get_list: 1, // eslint-disable-line camelcase
			list: id
		});

	let playlist = body.video.filter(song => song.privacy !== "private").map(video => ({
		identifier: video.encrypted_id,
		length: video.length_seconds * 1000,
		title: video.title
	}));

	playlist.title = body.title;
	return playlist;
};
