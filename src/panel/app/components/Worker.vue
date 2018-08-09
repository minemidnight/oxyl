<template>
	<div>
		<div class="card color-630 mb-3" @click="openModal()" :class="{ 'border-danger': worker.status !== 'ready' }">
			<div class="card-header color-700">
				<h5 class="card-title">Worker {{ worker.id }}</h5>
				<h6 class="card-subtitle text-muted">{{ worker.type }}</h6>
			</div>
			<div class="card-body color-630">
				<p class="card-text mb-0">Memory Usage: {{ (worker.memoryUsage / 1024 / 1024).toFixed(2) }} MiB</p>
				<p class="card-text" ref="uptime">Uptime: {{ getUptime() }}</p>
				<small class="text-info float-right">Click for more info</small>
			</div>
		</div>

		<modal ref="modal">
			<template slot="header">
				Worker {{ worker.id }}
			</template>

			<h6 class="text-muted lead">{{ worker.type }}</h6>
			<template v-if="worker.type === 'bot'">
				<p class="mb-0">Guilds: {{ worker.guilds }}</p>
				<p class="mb-0">Streams: {{ worker.streams }}</p>
				<p class="mb-0">Shards: {{ worker.shards }}</p>
			</template>
			<p class="mb-0" ref="uptime2">Uptime: {{ getUptime() }}</p>
			<p class="card-text mb-0">Memory Usage: {{ (worker.memoryUsage / Math.pow(1024, 3)).toFixed(2) }} GiB</p>
		
			<template v-if="worker.type === 'bot'">
				<div class="container-fluid text-center mt-3">
					<h6>Guilds</h6>
					<charttimespanselector
						selected="1w"
						:bind="{ object: worker.chartData, key: 'memoryUsage' }"
						:transform="body => [[{ label: 'Time', type: 'date' }, { label: 'Guilds', type: 'number' }]].concat(body.Guilds.map(({ time, value }) => [new Date(time), value / 1024 / 1024]))"
						:url="`workers/${worker.id}/guilds`"
					/>
					<chart
						type="LineChart"
						:data="worker.chartData.guilds"
						:options="graphOptions"
					/>
				</div>

				<div class="container-fluid text-center mt-3">
					<h6>Streams</h6>
					<charttimespanselector
						selected="24h"
						:bind="{ object: worker.chartData, key: 'streams' }"
						:transform="body => [[{ label: 'Time', type: 'date' }, { label: 'Streams', type: 'number' }]].concat(body.sstreams.map(({ time, value }) => [new Date(time), value / 1024 / 1024]))"
						:url="`workers/${worker.id}/streams`"
					/>
					<chart
						type="LineChart"
						:data="worker.chartData.streams"
						:options="graphOptions"
					/>
				</div>
			</template>

			<div class="container-fluid text-center mt-3">
				<h6>Memory Usage (GiB)</h6>
				<charttimespanselector
					selected="24h"
					:bind="{ object: worker.chartData, key: 'memoryUsage' }"
					:transform="body => [[{ label: 'Time', type: 'date' }, { label: 'MiB', type: 'number' }]].concat(body.memoryUsage.map(({ time, value }) => [new Date(time), value / 1024 / 1024]))"
					:url="`workers/${worker.id}/memoryUsage`"
				/>
				<chart
					type="AreaChart"
					:data="worker.chartData.memoryUsage"
					:options="graphOptions"
				/>
			</div>

			<template slot="footer">
				<button type="button" class="btn btn-outline-warning" :disabled="worker.status !== 'ready'" @click="ws.send({ op: 'restartWorker', target: worker.id })">Restart</button>
				<button type="button" class="btn btn-outline-danger" @click="ws.send({ op: 'killWorker', target: worker.id })">Kill</button>
			</template>
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

<script>
import { GChart as chart } from "vue-google-charts";
import store from "../store";

export default {
	data() {
		return {
			interval: null,
			ws: store.ws,
			graphOptions: {
				backgroundColor: "#1f1f1f",
				fontName: "IBM Plex Sans",
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
					format: "#,###",
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
		async openModal() {
			if(!this.worker.chartData.memoryUsage) await this.updateStats();
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
		},
		async updateStats(timespan = -1) {
			const { body: { guilds, memoryUsage, streams } } = await apiCall.get(`workers/${this.worker.id}`)
				.query({ timespan });

			if(this.worker.type === "bot") {
				this.worker.chartData.guilds = [[
					{ label: "Time", type: "date" },
					{ label: "Guilds", type: "number" }
				]].concat(guilds.map(({ time, value }) => [
					new Date(time),
					value
				]));

				this.worker.chartData.streams = [[
					{ label: "Time", type: "date" },
					{ label: "Streams", type: "number" }
				]].concat(streams.map(({ time, value }) => [
					new Date(time),
					value
				]));
			}

			this.worker.chartData.memoryUsage = [[
				{ label: "Time", type: "date" },
				{ label: "MiB", type: "number" }
			]].concat(memoryUsage.map(({ time, value }) => [
				new Date(time),
				value / 1024 / 1024
			]));
		}
	}
};
</script>
