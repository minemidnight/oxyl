<template>
	<div>
		<form v-if="loaded" @submit.prevent="update()">
			<div class="row">
				<div class="col-sm-12 col-md-6">
					<h4>Music Options</h4>
					<p>Options to configure Oxyl's music</p>
				</div>
				<div class="col-sm-12 col-md-6"></div>
				<div class="col-sm-12 col-md-6">
					<label>
						Now Playing messages
						<small class="form-text">Whether or not to enable messages that say "now playing &lt;song&gt;"</small>
					</label>
					<label class="tgl">
						<input type="checkbox" :checked="data.musicMessages" v-model="updateModel.musicMessages" />
						<span class="tgl_body">
							<span class="tgl_switch"></span>
							<span class="tgl_track">
								<span class="tgl_bgd"></span>
								<span class="tgl_bgd tgl_bgd-negative"></span>
							</span>
						</span>
					</label>
				</div>
				<div class="col-sm-12 col-md-6">
					<label>
						Vote Skip
						<small class="form-text">Whether or not to enable vote-skip functionality for the skip command (there is a flag that force skips for those with Manage Messages)</small>
					</label>
					<label class="tgl">
						<input type="checkbox" :checked="data.voteSkip" v-model="updateModel.voteSkip" />
						<span class="tgl_body">
							<span class="tgl_switch"></span>
							<span class="tgl_track">
								<span class="tgl_bgd"></span>
								<span class="tgl_bgd tgl_bgd-negative"></span>
							</span>
						</span>
					</label>
				</div>
				<div class="col-sm-12 col-md-6">
					<div class="form-group">
						<label for="song-length">
							Maximum Song Length
							<small class="form-text">The maximum length a song can be (in minutes) in order to be queued (0 = no limit), livestreams not included</small>
						</label>
						<input id="song-length" class="form-control" type="number" min="0" max="1440" v-model.number="updateModel.songLength" required />
					</div>
				</div>
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
			data: {},
			updateModel: {}
		};
	},
	async created() {
		const { error, body } = await apiCall.get(`music/${this.$route.params.guild}`);

		if(error) return;
		this.data = body;
		this.updateModel = Object.assign({}, this.data);
		this.loaded = true;
	},
	methods: {
		async update() {
			$("form button[type=submit]").addClass("disabled");

			const { error } = await apiCall
				.put(`music/${this.$route.params.guild}`)
				.send(this.updateModel);

			if(error) return;
			$("form button[type=submit]").removeClass("disabled");
		}
	}
};
</script>