<template>
	<div>
		<div v-if="loaded">
			<form id="add-sub" @submit.prevent="add()">
				<div class="row mb-3">
					<div class="col-sm-12 col-md-6">
						<h4>Add Subreddit</h4>
						<p>Oxyl will post new posts or top posts from a given subreddit to a certain channel</p>
					</div>
					<div class="col-sm-12 col-md-6">
						<p class="form-text text-danger" v-if="errors.add.alreadyExists">You already have the same subreddit posting to the same channel.</p>
					</div>
					<div class="col-sm-12 col-md-6">
						<div class="form-group">
							<label for="subreddit">
								Subreddit
								<small class="form-text">The subreddit to pull posts from (/r/ is optional)</small>
							</label>
							<input id="subreddit" v-model.trim="insertModel.subreddit" class="form-control" placeholder="Enter a subreddit" required pattern="^(?:\/?r\/)?[A-Za-z0-9_]{3,21}$" />
							<small class="form-text text-danger" v-if="errors.add.invalidSubreddit">Please only enter valid subreddits.</small>
						</div>
					</div>
					<div class="col-sm-12 col-md-6">
						<div class="form-group">
							<label for="channel">
								Channel
								<small class="form-text">What Discord channel to post to</small>
							</label>
							<select class="form-control" id="channel" v-model="insertModel.channelID" required>
								<option v-for="(channel, index) in channels.filter(({ canSend }) => canSend)" :key="index" :value="channel.id">#{{ channel.name }}</option>
							</select>
							<small class="form-text text-muted">Don't see your channel? Make sure Oxyl has permission to Send Messages and Read Messages in that channel.</small>
						</div>
					</div>
					<div class="col-sm-12 col-md-6">
						<label>
							Type
							<small class="form-text">Type of content to post</small>
						</label>
						<div class="form-group">
							<div class="form-check">
								<label class="form-check-label">
									<input class="form-check-input" v-model="insertModel.type" type="radio" name="type" value="new" checked />
									New
								</label>
							</div>
							<div class="form-check">
								<label class="form-check-label">
									<input class="form-check-input" v-model="insertModel.type" type="radio" name="type" value="top" />
									Top
								</label>
							</div>
						</div>
					</div>
				</div>
				<button type="submit" class="btn btn-primary">Add Subreddit</button>
			</form>

			<h4 class="mt-4" v-if="subs.length">Current Subreddits</h4>
			<div class="card-group" v-for="(subs, i) in chunkify(subs, [4, 3, 2].find(size => !(subs.length % size)) || 4)" :key="i">
				<div class="card color-600 color-hover-630" v-for="(sub, index) in subs" :key="index" :data-index="index">
					<div class="card-body">
						<button class="btn btn-danger float-right" @click="remove(index)">
							<i class="fa fa-trash-o" aria-hidden="true"></i>
						</button>
						<h5 class="card-title">{{ sub.subreddit }}</h5>
						<p class="card-text">Type: {{ sub.type }} posts</p>
						<p class="card-text">Posts to: #{{ channels.find(({ id }) => id === sub.channelID).name }}</p>
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
const defaultAdd = { alreadyExists: false, invalidSubreddit: false };
module.exports = {
	data() {
		return {
			loaded: false,
			channels: [],
			subs: [],
			errors: { add: Object.assign({}, defaultAdd) },
			insertModel: {}
		};
	},
	async created() {
		const { error, body: { subreddits, channels } } = await apiCall.get(`reddit/${this.$route.params.guild}`);

		if(error) return;
		this.subs = subreddits;
		this.channels = channels;
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

			$("#add-sub button[type=submit]").addClass("disabled");
			const { error, body } = await apiCall
				.put(`reddit/${this.$route.params.guild}`)
				.send(this.insertModel);

			$("#add-sub button[type=submit]").removeClass("disabled");
			if(error && body.redirect) {
				return;
			} else if(error) {
				if(body.invalidSubreddit) this.errors.add.invalidSubreddit = true;
				else if(body.alreadyExists) this.errors.add.alreadyExists = true;
			} else {
				this.subs.push(body);
				this.insertModel = {};
				$("#add-sub").trigger("reset");
			}
		},
		async remove(index) {
			$(`[data-index=${index}] button`).addClass("disabled");
			const { error } = await apiCall.delete(`reddit/${this.$route.params.guild}`).send({
				subreddit: this.subs[index].subreddit,
				channelID: this.subs[index].channelID
			});

			if(error) return;
			this.subs.splice(index, 1);
		}
	}
};
</script>