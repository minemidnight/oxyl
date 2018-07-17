<template>
	<div>
		<div class="row">
			<div class="col-sm-12 col-lg-8 col-md-6">
				<terminal />
			</div>
			<div class="col-sm-12 col-lg-4 col-md-6">
				<worker v-for="(worker, i) in workers.slice(0, 2)" :key="i" :worker="worker" />
				<router-link class="arrow mt-3" :to="{ name: 'workers' }">
					<p class="lead container float-left">View all workers</p>
				</router-link>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import "../variables";

.arrow {
	text-decoration: none;
	color: $color-text;
	display: block;

	position: relative;
	transition: ease-in-out 0.5s;

	& .lead {
		background: $color-600;
		width: calc(100% - 30px);
	}

	&:after {
		color: $color-600;
		border-left: 15px solid;
		border-top: 15px solid transparent;
		border-bottom: 15px solid transparent;
		display: inline-block;
		content: '';
		position: absolute;
		top: 0;
	}

	&:hover {
		transform: scale(1.05);
		
		& .lead {
			background: $color-630;
			color: white;
		}

		&:after {
			color: $color-630;
		}
	}
}
</style>


<script>
import store from "../store";

export default {
	data() {
		return store;
	}
};
</script>

