<template>
	<div>
		<div v-if="loaded">
			<form id="add-feed" @submit.prevent="add()">
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<h4>Add Channel</h4>
						<p>Oxyl will post to a certain channel when a Twitch stream goes on or offline</p>
					</div>
					<div class="col-sm-12 col-md-6">
						<p class="form-text text-danger" v-if="errors.add.alreadyExists">You already have the same twitch channel posting to the same discord channel, please edit it instead.</p>
					</div>
					<div class="col-sm-12 col-md-6">
						<div class="form-group">
							<label for="twitch-channel">
								Twitch Channel
								<small class="form-text">The Twitch channel to detect when streaming (not a full url)</small>
							</label>
							<input id="twitch-channel" v-model.trim="insertModel.twitchChannel" class="form-control" placeholder="Enter a channel" required pattern="^[a-zA-Z0-9_]{4,25}$" />
							<small class="form-text text-danger" v-if="errors.add.invalidChannel">Please enter a valid Twitch channel.</small>
						</div>
					</div>
					<div class="col-sm-12 col-md-6">
						<div class="form-group">
							<label for="discord-channel">
								Discord Channel
								<small class="form-text">What Discord channel to post to</small>
							</label>
							<select class="form-control" id="discord-channel" v-model="insertModel.discordChannel">
								<option v-for="(discordChannel, index) in discordChannels.filter(({ canSend }) => canSend)" :key="index" :value="discordChannel.id">#{{ discordChannel.name }}</option>
							</select>
							<small class="form-text text-muted">Don't see your text channel? Make sure Oxyl has permission to Send Messages and Read Messages in that text channel.</small>
						</div>
					</div>
				</div>
				<button type="submit" class="btn btn-primary">Add Channel</button>
			</form>

			<h4 class="mt-4" v-if="twitchFeeds.length">Current Channels</h4>
			<div class="card-group" v-for="(feedChunk, i) in chunkify(twitchFeeds, [4, 3, 2].find(size => !(twitchFeeds.length % size)) || 4)" :key="i">
				<div class="card color-600 color-hover-630" v-for="(feed, index) in feedChunk" :key="index" :data-index="index">
					<div class="card-body">
						<button class="btn btn-danger float-right" @click="remove(index)">
							<i class="fa fa-trash-o" aria-hidden="true"></i>
						</button>
						<h5 class="card-title">{{ feed.twitchChannel }}</h5>
						<p class="card-text">Posts to: #{{ discordChannels.find(({ id }) => id === feed.discordChannel).name }}</p>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="mt-4 loading">
			<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
		</div>
	</div>
</template>

<script>
const defaultAdd = { alreadyExists: false, invalidChannel: false };
export default {
	data() {
		return {
			loaded: false,
			twitchFeeds: [],
			discordChannels: [],
			errors: { add: Object.assign({}, defaultAdd) },
			insertModel: {}
		};
	},
	async created() {
		const { error, body: { twitchFeeds, discordChannels } } = await apiCall
			.get(`twitch/${this.$route.params.guild}`);

		if(error) return;
		this.twitchFeeds = twitchFeeds;
		this.discordChannels = discordChannels;
		this.loaded = true;
	},
	methods: {
		chunkify(array, size) {
			const chunkified = [];
			for(let i = 0; i < array.length; i += size) chunkified.push(array.slice(i, i + size));
			return chunkified;
		},
		async add() {
			this.errors.add = Object.assign({}, defaultAdd);

			this.$el.querySelectorAll("#add-channel button[type=submit]").forEach(button => {
				button.classList.add("disabled");
				button.disabled = true;
			});

			const { error, body } = await apiCall
				.put(`twitch/${this.$route.params.guild}`)
				.send(this.insertModel);

			this.$el.querySelectorAll("#add-censor button[type=submit]").forEach(button => {
				button.classList.remove("disabled");
				button.disabled = false;
			});

			if(error && body.redirect) {
				return;
			} else if(error) {
				if(body.invalidChannel) this.errors.add.invalidChannel = true;
				else if(body.alreadyExists) this.errors.add.alreadyExists = true;
			} else {
				this.twitchFeeds.push(body);
				this.insertModel = {};
				this.$el.querySelector("#add-channel").reset();
			}
		},
		async remove(index) {
			this.$el.querySelector(`[data-index=${index}] button`).classList.add("disabled");
			this.$el.querySelector(`[data-index=${index}] button`).disabled = true;
			const { error } = await apiCall.delete(`twitch/${this.$route.params.guild}`).send({
				twitchChannel: this.twitchFeeds[index].twitchChannel,
				discordChannel: this.twitchFeeds[index].discordChannel
			});

			if(error) return;
			this.twitchFeeds.splice(index, 1);
		}
	}
};
</script>