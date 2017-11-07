<template>
	<div>
		<div v-if="loaded">
			<form id="add-sub" @submit.prevent="addSub()">
				<h4>Add Subreddit</h4>
				<p class="form-text text-danger" v-if="errors.alreadyExists">You already have the same subreddit posting to the same channel, please edit it instead.</p>
				<div class="form-group">
					<label for="subreddit">Subreddit</label>
					<input id="subreddit" class="form-control" placeholder="Enter a subreddit" required pattern="^(?:\/?r\/)?[A-Za-z0-9_]{3,21}" />
					<small class="form-text text-danger" v-if="errors.invalidSubreddit">Please only enter valid subreddits.</small>
				</div>
				<div class="form-group">
					<label for="channel">Channel</label>
					<select class="form-control" id="channel">
						<option v-for="(channel, index) in channels.filter(({ canSend }) => canSend)" :key="index" :value="channel.id">#{{ channel.name }}</option>
					</select>
					<small class="form-text text-muted">Don't see your channel? Make sure Oxyl has permission to Send Messages and Read Messages in that channel.</small>
				</div>
				<div class="form-check">
					<label class="form-check-label">
						<input class="form-check-input" type="radio" name="type" id="new" value="new" checked>
						Post all new posts to the subreddit
					</label>
				</div>
				<div class="form-check">
					<label class="form-check-label">
						<input class="form-check-input" type="radio" name="type" id="top" value="top">
						Post all top content
					</label>
				</div>
				<button type="submit" class="btn btn-primary">Add Subreddit</button>
			</form>

			<h4>Current Subreddits</h4>
			<div class="card-group" v-for="(subs, i) in chunkify(currentSubs,  [4, 3, 2].find(size => !(currentSubs.length % size)) || 4)" :key="i">
				<div class="card color-600" v-for="(sub, index) in subs" :key="index">
					<div class="card-body">
						<h5 class="card-title">{{ sub.id[1] }}</h5>
						<p class="card-text">Type: {{ sub.type }} posts</p>
						<p class="card-text">Posts to: #{{ channels.find(({ id }) => id === sub.id[2]).name }}</p>
						<button class="btn btn-danger float-right" @click="removeSub(index)">Remove</button>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="d-flex justify-content-center mt-4">
			<i class="fa fa-spinner fa-spin" aria-hidden="true" style="font-size:48px"></i>
		</div>
	</div>
</template>

<script>
module.exports = {
	data() {
		return {
			loaded: false,
			channels: [],
			currentSubs: [],
			errors: {}
		};
	},
	async created() {
		const { error, body: { subreddits, channels } } = await apiCall("get", `reddit/${this.$route.params.guild}`);

		if(error) return;
		this.currentSubs = subreddits;
		this.channels = channels;
		this.loaded = true;
	},
	methods: {
		chunkify(array, size) {
			const chunkified = [];
			for(let i = 0; i < array.length; i += size) chunkified.push(array.slice(i, i + size));
			return chunkified;
		},
		async addSub() {
			let sub = $("#subreddit").val();
			if(/^\/?r\//.test(sub)) sub = sub.match(/^(?:\/?r\/)?([A-Za-z0-9_]{3,21})/)[1];
			const channel = $("#channel").val();
			const type = $("[name=type]:checked").val();

			const { error, body } = await apiCall("put", `reddit/${this.$route.params.guild}`, {
				send: {
					subreddit: sub,
					channel,
					type
				}
			});

			if(error && body.redirect) {
				return;
			} else if(error) {
				if(body.invalidSubreddit) this.errors.invalidSubreddit = true;
				else if(body.alreadyExists) this.errors.alreadyExists = true;
			} else {
				this.currentSubs.push(body.added);
				this.errors = {};
				$("#add-sub").trigger("reset");
			}
		},
		async removeSub(index) {
			const data = this.currentSubs[index];

			const { error } = await apiCall("delete", `reddit/${this.$route.params.guild}`, {
				send: {
					subreddit: data.id[1],
					channel: data.id[2]
				}
			});

			if(error) return;
			this.currentSubs.splice(data, 1);
		}
	}
};
</script>