<template>
	<div>
		<h1>Logs</h1>
		<p class="lead">
			Displaying level:
			<select :class="levels[selected.level]" v-model="selected.level">
				<option v-for="(className, level) in levels" :key="level" :class="className" :selected="selected.level === level">{{ level }}</option>
			</select>
		</p>
		<div class="terminal" ref="terminal" @scroll="scroll($event)">
			<div v-if="loading" class="text-center mt-3" style="font-size:64px">
				<i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>
			</div>
			<div class="line" v-for="(log, i) in logs" :key="i">
				<span class="time">{{ new Date(log.time).toLocaleString() }}</span>
				<span class="label">[{{ log.label }}]</span>
				<span class="level" :class="levels[log.level]">{{ log.levelDisplay }}</span>
				<span class="message">{{ log.message }}</span>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css?family=Fira+Mono");

.terminal {
	font-family: "Fira Mono", monospace;
	background: #0D1218;
	height: 77.5%;
	border-radius: 4px;
	border: 1px solid black;
	padding: 1px 6px;
	overflow-y: scroll;
}

.line {
	margin: 1px 0px;
	color: #99A3A4;
	font-size: 14px;
	white-space: pre-wrap;
	word-wrap: break-word;

	.time {
		color: #F1948A;
	}

	.label {
		color: #5DADE2;
	}
}
</style>

<script>
export default {
	data() {
		return {
			levels: {
				all: "text-primary",
				startup: "text-success",
				debug: "text-muted",
				info: "text-info",
				error: "text-danger",
				warn: "text-warning"
			},
			selected: { level: "all" },
			logs: [],
			perLoad: 50,
			maxedOut: false,
			loading: false
		};
	},
	methods: {
		scroll(event) {
			if(this.loading || this.maxedOut) return;

			if(event.target.scrollTop === 0) this.getLogs();
		},
		async getLogs() {
			this.loading = true;
			const { body: { logs } } = await apiCall.get("logs")
				.query({
					offset: this.logs.length,
					limit: this.perLoad,
					level: this.selected.level
				});


			logs.forEach(log => log.levelDisplay = `{${log.level.toUpperCase()}}`);
			this.logs = logs.reverse().concat(this.logs);

			this.loading = false;
			if(logs.length < this.perLoad) this.maxedOut = true;
			if(this.$refs.terminal.scrollTop === 0) {
				const height = this.$refs.terminal.scrollHeight;
				await this.$nextTick();
				this.$refs.terminal.scrollTop = this.$refs.terminal.scrollHeight - height;
			}

			return true;
		}
	},
	async mounted() {
		await this.getLogs();

		await this.$nextTick();
		this.$refs.terminal.scrollTop = this.$refs.terminal.scrollHeight;
	},
	watch: {
		selected: {
			handler(newSelected, oldSelected) {
				this.logs = [];
				this.maxedOut = false;

				this.getLogs();
			},
			deep: true
		}
	}
};
</script>
