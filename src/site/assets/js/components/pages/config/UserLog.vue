<template>
	<div>
		<div v-if="loaded">
			<form id="add-sub" @submit.prevent>
				<h4>Account Verification</h4>
				<p>Oxyl will create welcome or farewell messages in a certain channel</p>
				<div class="form-check">
					<label>
						Enabled
						<small class="form-text">Whether or not to enable this</small>
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
				<div class="form-check">
					<label>
						DM Greeting
						<small class="form-text">Whether or not Oxyl should DM the user the greeting message</small>
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
				<button type="submit" class="btn btn-primary">Save</button>
			</form>
		</div>
		<div v-else class="d-flex justify-content-center mt-4">
			<i class="fa fa-spinner fa-spin" aria-hidden="true" style="font-size:48px"></i>
		</div>
	</div>
</template>

<script>
module.exports = {
	data() {
		return { loaded: false };
	},
	async created() {
		this.loaded = true;
	}
};
</script>