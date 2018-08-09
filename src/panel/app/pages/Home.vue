<template>
	<div>
		<div class="row">
			<div class="col-sm-12 col-lg-8 col-md-6">
				<div class="row" id="cards">
					<div class="col-sm-12 col-lg-3 col-md-6 mb-3">
						<div class="card">
							<div class="card-body">
								<h5 class="card-title">Memory Usage</h5>
								<p class="card-text">{{ (Object.values(store.workers).reduce((a, b) => a + b.memoryUsage, 0) / 1024 / 1024).toLocaleString() }} MiB</p>
							</div>
						</div>
					</div>
					<div class="col-sm-12 col-lg-3 col-md-6 mb-3">
						<div class="card">
							<div class="card-body">
								<h5 class="card-title">Guilds</h5>
								<p class="card-text">{{ Object.values(store.workers).reduce((a, b) => a + (b.type === "bot" ? b.guilds : 0), 0).toLocaleString() }}</p>
							</div>
						</div>
					</div>
					<div class="col-sm-12 col-lg-3 col-md-6 mb-3">
						<div class="card">
							<div class="card-body">
								<h5 class="card-title">Active Streams</h5>
								<p class="card-text">{{ Object.values(store.workers).reduce((a, b) => a + (b.type === "bot" ? b.streams : 0), 0).toLocaleString() }}</p>
							</div>
						</div>
					</div>
					<div class="col-sm-12 col-lg-3 col-md-6 mb-3">
						<div class="card">
							<div class="card-body">
								<h5 class="card-title">Workers</h5>
								<p class="card-text">{{ Object.keys(store.workers).length.toLocaleString() }}</p>
							</div>
						</div>
					</div>
				</div>
				<div class="row" id="graphs">
					<div class="col-sm-12 col-md-12 col-lg-6 mb-3">
						<h4>Memory Usage</h4>
						<div v-if="!store.chartData.memoryUsage" style="font-size:64px">
							<i class="mt-2 fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>
						</div>
						<div v-else>
							<charttimespanselector
								selected="24h"
								:bind="{ object: store.chartData, key: 'memoryUsage' }"
								:transform="body => [[{ label: 'Time', type: 'date' }, { label: 'MiB', type: 'number' }]].concat(body.memoryUsage.map(({ time, value }) => [new Date(time), value / 1024 / 1024]))"
								url="stats/memoryUsage"
							/>
							<chart
								type="LineChart"
								:data="store.chartData.memoryUsage"
								:options="lineGraphOptions"
							/>
						</div>
					</div>
					<div class="col-sm-12 col-md-12 col-lg-6 mb-3">
						<h4>Guilds</h4>
						<div v-if="!store.chartData.guilds" style="font-size:64px">
							<i class="mt-2 fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>
						</div>
						<div v-else>
							<charttimespanselector
								selected="1w"
								:bind="{ object: store.chartData, key: 'guilds' }"
								:transform="body => [[{ label: 'Time', type: 'date' }, { label: 'Guilds', type: 'number' }]].concat(body.guilds.map(({ time, value }) => [new Date(time), value]))"
								url="stats/guilds"
							/>
							<chart
								type="LineChart"
								:data="store.chartData.guilds"
								:options="lineGraphOptions"
							/>
						</div>
					</div>
					<div class="col-sm-12 col-md-12 col-lg-6 mb-3">
						<h4>Users Cached</h4>
						<div v-if="!store.chartData.users" style="font-size:64px">
							<i class="mt-2 fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>
						</div>
						<div v-else>
							<charttimespanselector
								selected="1w"
								:bind="{ object: store.chartData, key: 'users' }"
								:transform="body => [[{ label: 'Time', type: 'date' }, { label: 'Users', type: 'number' }]].concat(body.users.map(({ time, value }) => [new Date(time), value]))"
								url="stats/users"
							/>
							<chart
								type="LineChart"
								:data="store.chartData.users"
								:options="lineGraphOptions"
							/>
						</div>
					</div>
					<div class="col-sm-12 col-md-12 col-lg-6 mb-3">
						<h4>Streams</h4>
						<div v-if="!store.chartData.streams" style="font-size:64px">
							<i class="mt-2 fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>
						</div>
						<div v-else>
							<charttimespanselector
								selected="24h"
								:bind="{ object: store.chartData, key: 'streams' }"
								:transform="body => [[{ label: 'Time', type: 'date' }, { label: 'Streams', type: 'number' }]].concat(body.streams.map(({ time, value }) => [new Date(time), value]))"
								url="stats/streams"
							/>
							<chart
								type="LineChart"
								:data="store.chartData.streams"
								:options="lineGraphOptions"
							/>
						</div>
					</div>
					<div class="col-sm-12 col-md-12 col-lg-6 mb-3">
						<h4>Average Messages per Second</h4>
						<div v-if="!store.chartData.messagesPerSecond" style="font-size:64px">
							<i class="mt-2 fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>
						</div>
						<div v-else>
							<charttimespanselector
								selected="24h"
								:bind="{ object: store.chartData, key: 'messagesPerSecond' }"
								:transform="body => [[{ label: 'Time', type: 'date' }, { label: 'Messages per Second', type: 'number' }]].concat(body.messages.map(({ time, value }) => [new Date(time), value]))"
								url="stats/messages"
							/>
							<chart
								type="LineChart"
								:data="store.chartData.messagesPerSecond"
								:options="lineGraphOptions"
							/>
						</div>
					</div>
					<div class="col-sm-12 col-md-12 col-lg-6 mb-3">
						<div>
							<h4>Command Usage</h4>
						</div>
						<div v-if="!store.chartData.commandUsage" style="font-size:64px">
							<i class="mt-2 fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>
						</div>
						<div v-else>
							<charttimespanselector
								selected="24h"
								:bind="{ object: store.chartData, key: 'commandUsage' }"
								:transform="body => [['Command', { label: 'Uses', type: 'number' }]].concat(body.commands.map(command => [command.group, command.reduction]))"
								url="stats/commandUsage"
							/>
							<chart
								type="BarChart"
								:data="store.chartData.commandUsage"
								:options="barGraphOptions"
							/>
						</div>
					</div>
				</div>
			</div>
			<div class="col-sm-12 col-lg-4 col-md-6">
				<worker v-for="(worker, i) in Object.values(store.workers).slice(0, 3)" :key="i" :worker="worker" />
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
import { GChart as chart } from "vue-google-charts";
import store from "../store";

export default {
	data() {
		return {
			store,
			barGraphOptions: {
				backgroundColor: "#1f1f1f",
				fontName: "IBM Plex Sans",
				legend: "none",
				chartArea: { width: "75%", height: "75%" },
				tooltip: { isHtml: true },
				vAxis: {
					format: "#,###",
					minorGridlines: { count: 1, color: "grey" },
					textStyle: { color: "white", fontSize: 12 }
				}
			},
			lineGraphOptions: {
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
				legend: "none",
				chartArea: { width: "75%", height: "75%" },
				tooltip: { isHtml: true }
			}
		};
	},
	async created() {
		const { body: stats } = await apiCall.get("stats");
		app.$set(store.chartData, "commandUsage",
			[
				["Command", { label: "Uses", type: "number" }]
			].concat(stats.commands.map(command => [command.group, command.reduction]))
		);

		app.$set(store.chartData, "memoryUsage",
			[
				[{ label: "Time", type: "date" }, { label: "MiB", type: "number" }]
			].concat(stats.memoryUsage.map(({ time, value }) => [new Date(time), value / 1024 / 1024]))
		);

		app.$set(store.chartData, "guilds",
			[
				[{ label: "Time", type: "date" }, { label: "Guilds", type: "number" }]
			].concat(stats.guilds.map(({ time, value }) => [new Date(time), value]))
		);

		app.$set(store.chartData, "users",
			[
				[{ label: "Time", type: "date" }, { label: "Users", type: "number" }]
			].concat(stats.users.map(({ time, value }) => [new Date(time), value]))
		);

		app.$set(store.chartData, "streams",
			[
				[{ label: "Time", type: "date" }, { label: "Streams", type: "number" }]
			].concat(stats.streams.map(({ time, value }) => [new Date(time), value]))
		);

		app.$set(store.chartData, "messagesPerSecond",
			[
				[{ label: "Time", type: "date" }, { label: "Messages per Second", type: "number" }]
			].concat(stats.messages.map(({ time, value }) => [new Date(time), value]))
		);
	},
	components: { chart }
};
</script>

