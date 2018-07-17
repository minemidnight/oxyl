<template>
	<div class="row">
		<div class="col-sm-12 col-lg-4 col-md-6" v-for="(worker, i) in workers" :key="i">
			<worker :worker="worker" />
		</div>
	</div>
</template>

<script>
import store from "../store";

export default {
	data() {
		return store;
	}
};
</script>
