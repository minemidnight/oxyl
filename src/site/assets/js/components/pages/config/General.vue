<template>
	<div>
		<form v-if="loaded" @submit.prevent="update()">
			<h4>Prefix</h4>
			<div class="form-group">
				<label for="prefix">
					Prefix
					<small class="form-text">The prefix for Oxyl to use. Set to o! to reset</small>
				</label>
				<input id="prefix" class="form-control" v-model="updateModel.prefix.value" required />
			</div>
			<div>
				<label>
					Overwrite Prefix
					<small class="form-text">Whether or not to overwrite the current prefix. If checked, only the set prefix will work, otherwise the default prefix plus the set prefix both will work.</small>
				</label>
				<label class="tgl">
					<input type="checkbox" v-model="updateModel.prefix.overwrite" :checked="data.prefix.overwrite" />
					<span class="tgl_body">
						<span class="tgl_switch"></span>
						<span class="tgl_track">
							<span class="tgl_bgd"></span>
							<span class="tgl_bgd tgl_bgd-negative"></span>
						</span>
					</span>
				</label>
			</div>
			<h4>Suggestions</h4>
			<p>Option to have a suggestions channel, where members can suggest something and other members can vote on it</p>
			<div>
				<label>
					Enabled
					<small class="form-text">Whether or not to enable the suggestions</small>
				</label>
				<label class="tgl">
					<input type="checkbox" :checked="data.suggestions.enabled" v-model="updateModel.suggestions.enabled" />
					<span class="tgl_body">
						<span class="tgl_switch"></span>
						<span class="tgl_track">
							<span class="tgl_bgd"></span>
							<span class="tgl_bgd tgl_bgd-negative"></span>
						</span>
					</span>
				</label>
			</div>
			<div class="form-group">
				<label for="channel">
					Channel
					<small class="form-text">What Discord channel the suggestions should be sent in</small>
				</label>
				<select class="form-control" id="channel" v-model="updateModel.suggestions.channelID">
					<option v-for="(channel, index) in channels.filter(({ canSend }) => canSend)" :key="index" :value="channel.id" :selected="channel.id === data.channelID">#{{ channel.name }}</option>
				</select>
				<small class="form-text text-muted">Don't see your channel? Make sure Oxyl has permission to Send Messages and Read Messages in that channel.</small>
			</div>
			<button type="submit" class="btn btn-success">Save</button>
		</form>
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
			data: { prefix: null, suggestions: null },
			updateModel: { prefix: null, suggestions: null }
		};
	},
	async created() {
		const { error, body } = await apiCall.get(`general/${this.$route.params.guild}`);

		if(error) return;
		this.channels = body.channels;
		delete body.channels;
		this.data = body;
		this.updateModel = Object.assign({}, this.data);
		this.loaded = true;
	},
	methods: {
		async update() {
			$("form button[type=submit]").addClass("disabled");

			const { error } = await apiCall
				.put(`general/${this.$route.params.guild}`)
				.send(this.updateModel);

			if(error) return;
			$("form button[type=submit]").removeClass("disabled");
		}
	}
};
</script>