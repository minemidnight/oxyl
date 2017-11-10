<template>
	<div>
		<div v-if="loaded">
			<form id="add-channel" @submit.prevent="add()">
				<h4>Add Channel</h4>
				<p class="form-text text-danger" v-if="errors.add.alreadyExists">You already have the same twitch channel posting to the same discord channel, please edit it instead.</p>
				<div class="form-group">
					<label for="twitch-channel">Twitch Channel</label>
					<input id="twitch-channel" class="form-control" placeholder="Enter a channel" required pattern="^[a-zA-Z0-9_]{4,25}$" />
					<small class="form-text text-danger" v-if="errors.add.invalidChannel">Please enter a valid Twitch channel.</small>
				</div>
				<div class="form-group">
					<label for="discord-channel">Discord Channel</label>
					<select class="form-control" id="discord-channel">
						<option v-for="(textChannel, index) in textChannels.filter(({ canSend }) => canSend)" :key="index" :value="textChannel.id">#{{ textChannel.name }}</option>
					</select>
					<small class="form-text text-muted">Don't see your text channel? Make sure Oxyl has permission to Send Messages and Read Messages in that text channel.</small>
				</div>
				<button type="submit" class="btn btn-primary">Add Channel</button>
			</form>

			<h4>Current Channels</h4>
			<div class="card-group" v-for="(channels, i) in chunkify(currentChannels, [4, 3, 2].find(size => !(currentChannels.length % size)) || 4)" :key="i">
				<div class="card color-600 color-hover-630" v-for="(channel, index) in subs" :key="index" data-toggle="modal" data-target="#edit-channel" @click="currentEdit = index">
					<div class="card-body">
						<h5 class="card-title">{{ channel.id[1] }}</h5>
						<p class="card-text">Posts to: #{{ textChannels.find(({ id }) => id === sub.id[2]).name }}</p>
					</div>
				</div>
			</div>

			<div class="modal fade" tabindex="-1" role="dialog" id="edit-channel" aria-hidden="true">
				<div class="modal-dialog" role="document">
					<form class="modal-content color-700" @submit.prevent="edit()">
						<div class="modal-header border-dark">
							<h5 class="modal-title">Edit Channel</h5>
							<button type="button" class="close text-danger" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div class="modal-body">
							<div class="form-group">
								<label for="twitch-channel-edit">Twitch Channel</label>
								<input id="twitch-channel-edit" class="form-control" placeholder="Enter a channel" required pattern="^[a-zA-Z0-9_]{4,25}$" />
								<small class="form-text text-danger" v-if="errors.edit.invalidChannel">Please enter a valid Twitch channel.</small>
							</div>
							<div class="form-group">
								<label for="discord-channel-edit">Discord Channel</label>
								<select class="form-control" id="discord-channel-edit">
									<option v-for="(textChannel, index) in textChannels.filter(({ canSend }) => canSend)" :key="index" :value="textChannel.id">#{{ textChannel.name }}</option>
								</select>
								<small class="form-text text-muted">Don't see your text channel? Make sure Oxyl has permission to Send Messages and Read Messages in that text channel.</small>
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
const defaultAdd = { alreadyExists: false, invalidChannel: false };
const defaultEdit = { invalidChannel: false };
module.exports = {
	data() {
		return {
			loaded: false,
			currentChannels: [],
			currentEdit: null,
			errors: { add: Object.assign({}, defaultAdd), edit: Object.assign({}, defaultEdit) },
			textChannels: []
		};
	},
	async created() {
		const { error, body: { channels, textChannels } } = await apiCall("get", `twitch/${this.$route.params.guild}`);

		if(error) return;
		this.currentChannels = channels;
		this.textChannels = textChannels;
		this.loaded = true;
	},
	methods: {
		chunkify(array, size) {
			const chunkified = [];
			for(let i = 0; i < array.length; i += size) chunkified.push(array.slice(i, i + size));
			return chunkified;
		},
		async add() {
			$("#add-channel button[type=submit]").addClass("disabled");
			const channel = $("#twitch-channel").val();
			const textChannel = $("#discord-channel").val();

			this.errors.add = Object.assign({}, defaultAdd);
			const { error, body } = await apiCall("put", `twitch/${this.$route.params.guild}`, {
				send: {
					channel,
					textChannel
				}
			});

			$("#add-channel button[type=submit]").removeClass("disabled");
			if(error && body.redirect) {
				return;
			} else if(error) {
				if(body.invalidChannel) this.errors.add.invalidChannel = true;
				else if(body.alreadyExists) this.errors.add.alreadyExists = true;
			} else {
				this.currentChannels.push(body.added);
				$("#add-channel").trigger("reset");
			}
		},
		async edit() {
			const data = this.currentChannels[this.currentEdit];

			$("#edit-channel button[type=submit]").addClass("disabled");
			const channel = $("#twitch-channel-edit").val();
			const textChannel = $("#discord-channel-edit").val();

			this.errors.edit = Object.assign({}, defaultEdit);
			if(data.id[1].toLowerCase() === channel.toLowerCase() && data.id[2] === channel) {
				$("#edit-channel").modal("hide");
				$("#edit-channel button[type=submit]").removeClass("disabled");
				return;
			}

			const { error, body } = await apiCall("patch", `twitch/${this.$route.params.guild}`, {
				send: {
					previous: {
						channel: data.id[1],
						textChannel: data.id[2]
					},
					edited: {
						channel,
						textChannel
					}
				}
			});

			$("#edit-channel button[type=submit]").removeClass("disabled");
			if(error && body.redirect) {
				return;
			} else if(error) {
				if(body.invalidChannel) this.errors.edit.invalidChannel = true;
			} else {
				Object.assign(this.currentChannels[this.currentEdit], body.edited);
				$("#edit-channel").modal("hide");
			}
		},
		async remove(index) {
			const data = this.currentChannels[this.currentEdit];

			const { error } = await apiCall("delete", `twitch/${this.$route.params.guild}`, {
				send: {
					channel: data.id[1],
					textChannel: data.id[2]
				}
			});

			if(error) return;
			this.currentChannels.splice(this.currentEdit, 1);
			$("#edit-channel").modal("hide");
		}
	},
	watch: {
		currentEdit(index) {
			const data = this.currentChannels[index];

			$("#twitch-channel-edit").val(data.id[1]);
			$("#discord-channel-edit").val(data.id[2]);
		}
	}
};
</script>