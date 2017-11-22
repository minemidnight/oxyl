<template>
	<div>
		<form v-if="loaded" @submit.prevent="update()">
			<h4>Mod-Log</h4>
			<p>Options to configure Oxyl's mod log, where moderation actions (kick, mute, ban, etc) are logged to a channel with reasons</p>
			<div class="form-check">
				<label>
					Enabled
					<small class="form-text">Whether or not to enable the mod log</small>
				</label>
				<label class="tgl">
					<input type="checkbox" />
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
					<small class="form-text">What Discord channel the modlog should be in</small>
				</label>
				<select class="form-control" id="channel">
					<option v-for="(channel, index) in channels.filter(({ canSend }) => canSend)" :key="index" :value="channel.id">#{{ channel.name }}</option>
				</select>
				<small class="form-text text-muted">Don't see your channel? Make sure Oxyl has permission to Send Messages and Read Messages in that channel.</small>
			</div>
			<h4>Tracked Roles</h4>
			<p>Whenever one of these roles are added or removed from a person, a mod log entry is made</p>
			<div class="form-group">
				<div class="row" id="roleme">
					<div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3" v-for="(role, index) in roles" :key="index">
						<label class="form-check-label">
							<input type="checkbox" class="form-check-input" :value="role.id" :checked="~tracked.indexOf(role.id)">
							{{ role.name }}
						</label>
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
			channels: [],
			tracked: [],
			roles: []
		};
	},
	async created() {
		this.loaded = true;
	}
};
</script>