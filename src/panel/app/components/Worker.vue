<template>
	<div>
		<div class="card color-630 mb-3" @click="openModal()">
			<div class="card-header color-700">
				<h5 class="card-title">Worker {{ worker.id }}</h5>
				<h6 class="card-subtitle text-muted">{{ worker.type }}</h6>
			</div>
			<div class="card-body color-630">
				<p class="card-text mb-0">Memory Usage: {{ (worker.memoryUsage / Math.pow(1024, 3)).toFixed(2) }} GiB</p>
				<p class="card-text" ref="uptime">Uptime: {{ getUptime() }}</p>
				<small class="text-info float-right">Click for more info</small>
			</div>
		</div>

		<modal ref="modal">
			<template slot="header">
				Worker {{ worker.id }}
			</template>

			<h6 class="text-muted lead">{{worker.type}}</h6>
			<template v-if="worker.type === 'bot'">
				<p class="mb-0">Guilds: {{ worker.guilds }}</p>
				<p class="mb-0">Streams: {{ worker.streams }}</p>
				<p class="mb-0">Shards: {{ worker.shards }}</p>
			</template>
			<p class="mb-0" ref="uptime2">Uptime: {{ getUptime() }}</p>
			<p class="card-text mb-0">Memory Usage: {{ (worker.memoryUsage / Math.pow(1024, 3)).toFixed(2) }} GiB</p>
		
			<div class="container-fluid text-center mt-3">
				<h6>Guilds</h6>
				<chart
					v-if="worker.type === 'bot'"
					type="LineChart"
					:data="worker.chartData.guilds"
					:options="graphOptions"
				/>
			</div>

			<div class="container-fluid text-center mt-3">
				<h6>Memory Usage (GiB)</h6>
				<chart
					type="AreaChart"
					:data="worker.chartData.memory"
					:options="graphOptions"
				/>
			</div>
		</modal>
	</div>
</template>

<style lang="scss" scoped>
.card {
	transition: 0.25s ease-in;
	cursor: pointer;

	&:hover {
		transform: scale(1.025);
	}
}
</style>

<style lang="scss">
@import "../variables";

.google-visualization-tooltip {
	background: $color-630 !important;
	border: 1px solid $color-700 !important;

	box-shadow: none !important;
	-webkit-box-shadow: none !important;
	
	padding: 0.5em 0.25em;
	height: auto !important;

	ul {
		margin: 0;

		li {
			margin: 0.25em 0 !important;
			padding: 0;

			span {
				color: $color-text !important;
			}
		}
	}
}
</style>

<script>
import { GChart as chart } from "vue-google-charts";

export default {
	data() {
		return {
			interval: null,
			graphOptions: {
				backgroundColor: "#1f1f1f",
				fontName: "Raleway",
				hAxis: {
					gridlines: {
						count: -1,
						color: "transparent",
						units: {
							days: { format: ["MMM dd"] },
							hours: { format: ["HH:mm", "ha"] }
						}
					},
					minorGridlines: {
						count: 1,
						units: {
							hours: { format: ["hh:mm:ss a", "ha"] },
							minutes: { format: ["HH:mm a Z", ":mm"] }
						}
					}
				},
				vAxis: {
					format: "decimal",
					gridlines: { count: 4 },
					minorGridlines: { count: 1, color: "grey" }
				},
				width: 436,
				height: 210,
				legend: "none",
				chartArea: { width: "75%", height: "75%" },
				tooltip: { isHtml: true }
			}
		};
	},
	props: ["worker"],
	components: { chart },
	async mounted() {
		this.interval = setInterval(() => this.updateUptime(), 1000);
	},
	beforeDestroy() {
		clearInterval(this.interval);
	},
	methods: {
		openModal() {
			this.$refs.modal.show();
		},
		getUptime() {
			const uptime = Date.now() - this.worker.startTime;

			return Object.entries({
				months: Math.floor(uptime / 2592000000),
				weeks: Math.floor(uptime % 2592000000 / 604800000),
				days: Math.floor(uptime % 2592000000 % 604800000 / 86400000),
				hours: Math.floor(uptime % 2592000000 % 604800000 % 86400000 / 3600000),
				minutes: Math.floor(uptime % 2592000000 % 604800000 % 86400000 % 3600000 / 60000),
				seconds: Math.floor(uptime % 2592000000 % 604800000 % 86400000 % 3600000 % 60000 / 1000)
			}).reduce((a, [key, value]) => {
				if(!value) return a;
				else return `${a} ${value}${key === "months" ? "M" : key.charAt(0)}`;
			}, "");
		},
		updateUptime() {
			const uptime = `Uptime: ${this.getUptime()}`;
			this.$refs.uptime.innerHTML = uptime;
			this.$refs.uptime2.innerHTML = uptime;
		}
	}
};
</script>
