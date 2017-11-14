<template>
	<div>
		<div v-if="loaded">
			empty
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