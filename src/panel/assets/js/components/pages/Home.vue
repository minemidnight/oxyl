<template>
	<div>
		<h2 class="text-white">Workers</h2>
		<div class="row" v-for="chunk in chunkify(workers, 3)" :key="chunk">
			<div class="col-lg-4 col-md-6 col-sm-12 mb-2" v-for="worker in chunk" :key="worker">
				<div class="card text-white" :class="{ 'border-danger': worker.status === 'offline', 'border-warning': worker.status === 'online', 'border-success': worker.status === 'ready' }">
					<div class="card-header bg-elegant-dark d-flex justify-content-end">
						<span class="lead mr-auto">Worker {{ worker.id }}</span>
						<button type="button" class="btn btn-outline-danger mr-2" :disabled="worker.status === 'offline'" @click="ws.sendJSON({ op: 'kill', id: worker.id })">Kill Worker</button>
						<button type="button" class="btn btn-outline-warning" :disabled="worker.status === 'offline' || worker.status === 'online'" @click="ws.sendJSON({ op: 'restart', id: worker.id })">Restart Worker</button>
					</div>
					<div class="card-body bg-elegant">
						<h5 class="card-title">Type: {{ worker.type }}</h5>
						<p class="card-text" v-if="worker.status !== 'offline'">Memory Usage (GiB): {{ worker.heap / Math.pow(1024, 3) }}</p>
						<p class="card-text" v-if="worker.type === 'bot' && worker.shards">Shards: {{ worker.shards.substring(worker.shards.indexOf(" ") + 1) }}</p>
						<p class="card-text" v-if="worker.status !== 'offline'">Start Time: {{ new Date(worker.startTime).toLocaleString("en-US") }}</p>
					</div>
				</div>
			</div>
		</div>

		<h2 class="text-white mt-4">Logs</h2>
		<div class="jumbotron p-0 terminal">
			<div class="terminal-container">
				<div class="terminal-lines p-2">
					<pre v-for="log in logs" :key="log">{{ log }}</pre>
				</div>

				<div class="input">
					<input @keyup.enter="ws.sendJSON({ op: 'exec', command: $event.target.value });$event.target.value = ''" />
				</div>
			</div>
		</div>

		<h2 class="text-white mt-4">Actions</h2>
		<div class="container mb-2 d-flex justify-content-center">
			<h5 class="mr-auto text-white">Bot</h5>
			<div class="btn-group" role="group">
				<button type="button" class="btn btn-danger" @click="ws.sendJSON({ op: 'restartBotHard' })">Hard Restart</button>
				<button type="button" class="btn btn-warning" @click="ws.sendJSON({ op: 'restartBotRolling' })">Rolling Restart</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return require("../../data")
	},
	methods: {
		chunkify: (array, size) => {
			const chunkified = [];
			for(let i = 0; i < array.length; i += size) chunkified.push(array.slice(i, i + size));
			return chunkified;
		}
	},
	watch: {
		logs: (val, oldVal) => {
			app.$nextTick(() => {
				const div = document.querySelector(".terminal-container .terminal-lines")
				div.scrollTop = div.scrollHeight;
			});
		}
	}
}
</script>