<template>
	<div>
		<div class="row">
			<div class="col-sm-12 col-lg-8 col-md-6">
				<terminal />
			</div>
			<div class="col-sm-12 col-lg-4 col-md-6">
				<worker v-for="(worker, i) in workers" :key="i" :worker="worker" />
				<div class="container arrow">
					View all workers
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.arrow {

}
</style>


<script>
export default {
	data() {
		return require("../store");
	}
};
</script>

