<template>
	<div>
		<worker v-for="(worker, i) in workers" :key="i" :worker="worker" />
	</div>
</template>

<script>
export default {
	data() {
		return require("../store");
	}
};
</script>
