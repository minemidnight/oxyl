const Player = require("../../modules/Player");

module.exports = {
	run: async ({
		args: [query], channel, client, flags: { soundcloud, pick }, guild,
		member, reply, t, wiggle, wiggle: { locals: { r } }
	}) => {
		let voiceChannel, player = Player.getPlayer(guild.id);
		if(member.voiceState && member.voiceState.channelID) voiceChannel = guild.channels.get(member.voiceState.channelID);

		if(!voiceChannel) {
			return t("commands.play.notInChannel");
		} else if(!voiceChannel.permissionsOf(client.user.id).has("voiceConnect")) {
			return t("commands.play.cantJoin");
		} else if(!voiceChannel.permissionsOf(client.user.id).has("voiceSpeak")) {
			return t("commands.play.cantSpeak");
		} else if(!player) {
			player = new Player(guild, wiggle);
			player.textChannelID = channel.id;
		}

		if(player && player.maxSongLength === null) {
			player.maxSongLength = await r.table("musicSettings")
				.get(guild.id)
				.default({ songLength: 0 })
				.getField("songLength")
				.mul(60)
				.run() || Infinity;
		}
		if(soundcloud) query = `scsearch:${query}`;

		let item;
		if(pick) {
			item = await player.queueItem(query, async songs => {
				reply(t("commands.play.select", {
					songs: songs
						.map(({ author, title }, i) => `${i + 1}). ${title} \`${author}\``)
						.join("\n")
				}));

				let [choice] = await channel.awaitMessages(msg => msg.author.id === member.id, {
					time: 45000,
					maxMatches: 1
				});

				if(!choice) return t("commands.play.select.timedOut");
				else choice = choice.content.toLowerCase();

				if(~["c", "cancel"].indexOf(choice)) {
					return t("commands.play.select.cancelled");
				} else if(isNaN(choice) || parseInt(choice) < 1 || parseInt(choice) > songs.length) {
					return t("commands.play.select.invalidInput");
				} else {
					return songs[parseInt(choice) - 1];
				}
			});
		} else {
			item = await player.queueItem(query);
		}

		if(typeof item === "string") {
			if(item === "NOT_RESOLVED") return t("commands.play.notResolved");
			else if(item === "QUEUE_LIMIT") return t("commands.play.queueLimit");
			else if(item === "SONG_LENGTH") return t("commands.play.songLength", { minutes: player.maxSongLength / 60 });
			else return item;
		}

		if(player && !player.connection) await player.connect(voiceChannel);
		if(!player.currentSong) player.play();

		if(Array.isArray(item)) return t("commands.play.playlist", { count: item.length });
		else return t("commands.play.song", { title: item.title });
	},
	guildOnly: true,
	caseSensitive: true,
	args: [{
		type: "text",
		label: "search query|link"
	}],
	flags: [{
		name: "soundcloud",
		short: "s",
		type: "boolean",
		default: false
	}, {
		name: "pick",
		short: "p",
		aliases: ["search", "select"],
		type: "boolean",
		default: false
	}]
};
