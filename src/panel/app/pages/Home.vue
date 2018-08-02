<template>
	<div>
		<div class="row">
			<div class="col-sm-12 col-lg-8 col-md-6">
				<div class="row" id="cards">
					<div class="col-sm-12 col-lg-3 col-md-6 mb-3">
						<div class="card">
							<div class="card-body">
								<h5 class="card-title">Memory Usage</h5>
								<p class="card-text">{{ (Object.values(workers).reduce((a, b) => a + b.memoryUsage, 0) / 1024 / 1024).toLocaleString() }} MiB</p>
							</div>
						</div>
					</div>
					<div class="col-sm-12 col-lg-3 col-md-6 mb-3">
						<div class="card">
							<div class="card-body">
								<h5 class="card-title">Guilds</h5>
								<p class="card-text">{{ Object.values(workers).reduce((a, b) => a + (b.type === "bot" ? b.guilds : 0), 0).toLocaleString() }}</p>
							</div>
						</div>
					</div>
					<div class="col-sm-12 col-lg-3 col-md-6 mb-3">
						<div class="card">
							<div class="card-body">
								<h5 class="card-title">Active Streams</h5>
								<p class="card-text">{{ Object.values(workers).reduce((a, b) => a + (b.type === "bot" ? b.streams : 0), 0).toLocaleString() }}</p>
							</div>
						</div>
					</div>
					<div class="col-sm-12 col-lg-3 col-md-6 mb-3">
						<div class="card">
							<div class="card-body">
								<h5 class="card-title">Workers</h5>
								<p class="card-text">{{ Object.keys(workers).length.toLocaleString() }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="col-sm-12 col-lg-4 col-md-6">
				<worker v-for="(worker, i) in Object.values(workers).slice(0, 2)" :key="i" :worker="worker" />
				<router-link class="arrow mt-3" :to="{ name: 'workers' }">
					<p class="lead container float-left">View all workers</p>
				</router-link>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import "../variables";

#cards {
	.card {
		background-color: $color-630;
	}
}

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

