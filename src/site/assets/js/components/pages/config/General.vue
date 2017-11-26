<template>
	<div>
		<form v-if="loaded" @submit.prevent="update()">
			<h4>Prefix</h4>
			<div class="form-group">
				<label for="prefix">
					Prefix
					<small class="form-text">The prefix for Oxyl to use. Set to o! to reset</small>
				</label>
				<input id="prefix" class="form-control" v-model="updateModel.prefix.value" :value="data.prefix.value" required />
			</div>
			<div class="form-check">
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
			data: { prefix: null },
			updateModel: { prefix: null }
		};
	},
	async created() {
		const { error, body } = await apiCall.get(`general/${this.$route.params.guild}`);

		if(error) return;
		this.data = body;
		this.updateModel = Object.assign({}, this.data);
		this.loaded = true;
	},
	methods: {
		async update() {
			$("form button[type=submit]").addClass("disabled");

			const { error } = await apiCall.put(`general/${this.$route.params.guild}`).send({
				prefix: {
					value: this.updateModel.prefix.value,
					overwrite: this.updateModel.prefix.overwrite
				}
			});

			if(error) return;
			$("form button[type=submit]").removeClass("disabled");
		}
	}
};
</script>