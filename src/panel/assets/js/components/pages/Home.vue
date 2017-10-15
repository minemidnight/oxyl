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
						<p class="card-text" v-if="worker.type === 'bot'">Shards: {{ worker.shards }}</p>
						<p class="card-text" v-if="worker.status !== 'offline'">Start Time: {{ new Date(worker.startTime).toLocaleString("en-US") }}</p>
					</div>
				</div>
			</div>
		</div>

		<h2 class="text-white mt-4">Logs</h2>
		<div class="jumbotron p-2" style="height:350px;overflow-y:auto">
			<button type="button" class="btn btn-primary" @click="logs = []" style="position:absolute">Clear</button>
			<pre v-for="(log, index) in logs" :key="log">
				<var>{{ new Date().toLocaleString("en-US") }}</var>
				<samp>{{logs[logs.length - 1 - index]}}</samp>
			</pre>
		</div>

		<h2 class="text-white mt-4">Actions</h2>
		<div class="container mb-2 d-flex justify-content-center">
			<h5 class="mr-auto text-white">Other</h5>
			<div class="btn-group" role="group">
				<button type="button" class="btn btn-primary" @click="ws.sendJSON({ op: 'git-pull' })">git pull</button>
				<button type="button" class="btn btn-secondary" @click="ws.sendJSON({ op: 'npm-i' })">npm i</button>
			</div>
		</div>
		<div class="container mb-2 d-flex justify-content-center">
			<h5 class="mr-auto text-white">Bot</h5>
			<div class="btn-group" role="group">
				<button type="button" class="btn btn-success" v-if="botData.startable" @click="ws.sendJSON({ op: 'botStartup' })">Start</button>
				<button type="button" class="btn btn-danger" v-if="botData.restartable" @click="ws.sendJSON({ op: 'botHardRestart' })">Hard Restart</button>
				<button type="button" class="btn btn-warning" v-if="botData.restartable" @click="ws.sendJSON({ op: 'botRollingRestart' })">Rolling Restart</button>
			</div>
		</div>
		<div class="container mb-5 d-flex justify-content-center">
			<h5 class="mr-auto text-white">Redis</h5>
			<div class="btn-group" role="group">
				<button type="button" class="btn btn-info" @click="ws.sendJSON({ op: 'clearRedis' })">Clear Cache</button>
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
	}
}
</script>