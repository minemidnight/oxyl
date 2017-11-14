<template>
	<div>
		<div v-if="loaded">
			<form id="add-sub" @submit.prevent="add()">
				<h4>Add Subreddit</h4>
				<p>Oxyl will post new posts, or top posts from a subreddit to a certain channel</p>
				<p class="form-text text-danger" v-if="errors.add.alreadyExists">You already have the same subreddit posting to the same channel, please edit it instead.</p>
				<div class="form-group">
					<label for="subreddit">
						Subreddit
						<small class="form-text">The subreddit to pull posts from (/r/ is optional)</small>
					</label>
					<input id="subreddit" class="form-control" placeholder="Enter a subreddit" required pattern="^(?:\/?r\/)?[A-Za-z0-9_]{3,21}$" />
					<small class="form-text text-danger" v-if="errors.add.invalidSubreddit">Please only enter valid subreddits.</small>
				</div>
				<div class="form-group">
					<label for="channel">
						Channel
						<small class="form-text">What Discord channel to post to</small>
					</label>
					<select class="form-control" id="channel">
						<option v-for="(channel, index) in channels.filter(({ canSend }) => canSend)" :key="index" :value="channel.id">#{{ channel.name }}</option>
					</select>
					<small class="form-text text-muted">Don't see your channel? Make sure Oxyl has permission to Send Messages and Read Messages in that channel.</small>
				</div>
				<small class="form-text">Type of content to post</small>
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
				<div class="card color-600 color-hover-630" v-for="(sub, index) in subs" :key="index" data-toggle="modal" data-target="#edit-sub" @click="currentEdit = index">
					<div class="card-body">
						<h5 class="card-title">{{ sub.id[1] }}</h5>
						<p class="card-text">Type: {{ sub.type }} posts</p>
						<p class="card-text">Posts to: #{{ channels.find(({ id }) => id === sub.id[2]).name }}</p>
					</div>
				</div>
			</div>

			<div class="modal fade" tabindex="-1" role="dialog" id="edit-sub" aria-hidden="true">
				<div class="modal-dialog" role="document">
					<form class="modal-content color-700" @submit.prevent="edit()">
						<div class="modal-header border-dark">
							<h5 class="modal-title">Edit Subreddit</h5>
							<button type="button" class="close text-danger" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div class="modal-body">
							<div class="form-group">
								<label for="subreddit-edit">Subreddit</label>
								<input id="subreddit-edit" class="form-control" placeholder="Enter a subreddit" required pattern="^(?:\/?r\/)?[A-Za-z0-9_]{3,21}$" />
								<small class="form-text text-danger" v-if="errors.edit.invalidSubreddit">Please only enter valid subreddits.</small>
							</div>
							<div class="form-group">
								<label for="channel-edit">Channel</label>
								<select class="form-control" id="channel-edit">
									<option v-for="(channel, index) in channels.filter(({ canSend }) => canSend)" :key="index" :value="channel.id">#{{ channel.name }}</option>
								</select>
								<small class="form-text text-muted">Don't see your channel? Make sure Oxyl has permission to Send Messages and Read Messages in that channel.</small>
							</div>
							<div class="form-check">
								<label class="form-check-label">
									<input class="form-check-input" type="radio" name="type-edit" id="new-edit" value="new" checked>
									Post all new posts to the subreddit
								</label>
							</div>
							<div class="form-check">
								<label class="form-check-label">
									<input class="form-check-input" type="radio" name="type-edit" id="top-edit" value="top">
									Post all top content
								</label>
							</div>
						</div>
						<div class="modal-footer border-dark">
							<button type="submit" class="btn btn-success">Save</button>
							<button type="button" class="btn btn-danger" @click="remove()">Delete</button>
						</div>
					</form>
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
const defaultEdit = { invalidSubreddit: false };
module.exports = {
	data() {
		return {
			loaded: false,
			channels: [],
			currentSubs: [],
			errors: { add: Object.assign({}, defaultAdd), edit: Object.assign({}, defaultEdit) },
			currentEdit: null
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
		async add() {
			$("#add-sub button[type=submit]").addClass("disabled");
			let sub = $("#subreddit").val();
			if(/^\/?r\//.test(sub)) sub = sub.match(/^(?:\/?r\/)?([A-Za-z0-9_]{3,21})/)[1];
			const channel = $("#channel").val();
			const type = $("[name=type]:checked").val();

			this.errors.add = Object.assign({}, defaultAdd);
			const { error, body } = await apiCall("put", `reddit/${this.$route.params.guild}`, {
				send: {
					subreddit: sub,
					channel,
					type
				}
			});

			$("#add-sub button[type=submit]").removeClass("disabled");
			if(error && body.redirect) {
				return;
			} else if(error) {
				if(body.invalidSubreddit) this.errors.add.invalidSubreddit = true;
				else if(body.alreadyExists) this.errors.add.alreadyExists = true;
			} else {
				this.currentSubs.push(body.added);
				$("#add-sub").trigger("reset");
			}
		},
		async edit() {
			const data = this.currentSubs[this.currentEdit];

			$("#edit-sub button[type=submit]").addClass("disabled");
			let sub = $("#subreddit-edit").val();
			if(/^\/?r\//.test(sub)) sub = sub.match(/^(?:\/?r\/)?([A-Za-z0-9_]{3,21})/)[1];
			const channel = $("#channel-edit").val();
			const type = $("[name=type-edit]:checked").val();

			this.errors.edit = Object.assign({}, defaultEdit);
			if(data.type === type && data.id[1].toLowerCase() === sub.toLowerCase() && data.id[2] === channel) {
				$("#edit-sub").modal("hide");
				$("#edit-sub button[type=submit]").removeClass("disabled");
				return;
			}

			const { error, body } = await apiCall("patch", `reddit/${this.$route.params.guild}`, {
				send: {
					previous: {
						subreddit: data.id[1],
						channel: data.id[2]
					},
					edited: {
						subreddit: sub,
						channel,
						type
					}
				}
			});

			$("#edit-sub button[type=submit]").removeClass("disabled");
			if(error && body.redirect) {
				return;
			} else if(error) {
				if(body.invalidSubreddit) this.errors.edit.invalidSubreddit = true;
			} else {
				Object.assign(this.currentSubs[this.currentEdit], body.edited);
				$("#edit-sub").modal("hide");
			}
		},
		async remove(index) {
			const data = this.currentSubs[this.currentEdit];

			const { error } = await apiCall("delete", `reddit/${this.$route.params.guild}`, {
				send: {
					subreddit: data.id[1],
					channel: data.id[2]
				}
			});

			if(error) return;
			this.currentSubs.splice(this.currentEdit, 1);
			$("#edit-sub").modal("hide");
		}
	},
	watch: {
		currentEdit(index) {
			const data = this.currentSubs[index];

			$("#subreddit-edit").val(data.id[1]);
			$("#channel-edit").val(data.id[2]);
			$(`#${data.type}-edit`).prop("checked", "true");
		}
	}
};
</script>