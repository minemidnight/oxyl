<template>
	<div>
		<div class="row">
			<div class="col-sm-12 col-lg-4 col-md-6" v-for="(worker, i) in workers" :key="i">
				<worker :worker="worker" />
			</div>
		</div>
		<div class="mt-4">
			<h4>Bot Options</h4>
			<div class="btn-group" role="group">
				<button type="button" class="btn btn-warning" @click="ws.send({ op: 'rollingRestart' })">Rolling Restart</button>
				<button type="button" class="btn btn-danger" @click="ws.send({ op: 'hardRestart' })">Hard Restart</button>
			</div>
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
