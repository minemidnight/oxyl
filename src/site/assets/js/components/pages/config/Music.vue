<template>
	<div>
		<form v-if="loaded" @submit.prevent="update()">
			<h4>Music Options</h4>
			<p>Options to configure Oxyl's music</p>
			<div class="form-check">
				<label>
					Now Playing messages
					<small class="form-text">Whether or not to enable messages that say "now playing &lt;song&gt;"</small>
				</label>
				<label class="tgl">
					<input type="checkbox" :checked="data.musicMessages !== false" />
					<span class="tgl_body">
						<span class="tgl_switch"></span>
						<span class="tgl_track">
							<span class="tgl_bgd"></span>
							<span class="tgl_bgd tgl_bgd-negative"></span>
						</span>
					</span>
				</label>
			</div>
			<div class="form-check">
				<label>
					Vote Skip
					<small class="form-text">Whether or not to enable vote-skip functionality for the skip command (there is a flag that force skips for those with Manage Messages)</small>
				</label>
				<label class="tgl">
					<input type="checkbox" :checked="data.voteSkip" />
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
				<label for="song-length">
					Maximum Song Length
					<small class="form-text">The maximum length a song can be (in seconds) in order to queue it (0 = no limit)</small>
				</label>
				<input id="song-length" class="form-control" type="number" min="0" :value="data.songLength || 0" />
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
			data: {}
		};
	},
	async created() {
		this.loaded = true;
	}
};
</script>