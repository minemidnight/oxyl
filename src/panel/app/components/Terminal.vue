<template>
	<div class="terminal" ref="terminal" @click="setFocus()">
		<pre v-if="ready" class="line" v-for="(line, i) of messages" :key="i">{{ toLine(line) }}</pre>

		<pre class="line input"><span>{{ location }}</span> <input ref="input" v-model="input" /></pre>
		<pre v-if="ready" class="line" v-for="i in 5" :key="i">{{ toLine("") }}</pre>
	</div>
</template>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css?family=Fira+Mono");

.terminal {
	font-family: "Fira Mono", monospace;
	background: #0D1218;
	height: calc(100% - 4rem);
	border-radius: 4px;
	border: 1px solid black;
	padding: 1px 6px;

	overflow-y: scroll;
}

.line {
	margin: 0;
	color: #99A3A4;
	font-size: 14px;
	white-space: pre-wrap;
	word-wrap: break-word;
}

.input {
	input {
		color: #99A3A4;
		background: transparent;
		outline: none;
		border: none;
	}
}
</style>

<script>
import store from "../store";

export default {
	data() {
		return {
			location: "root@ns533541:~#",
			messages: store.terminal,
			ready: false,
			input: ""
		};
	},
	mounted() {
		this.ready = true;

		this.fixInputSize();
		window.addEventListener("resize", () => {
			this.fixInputSize();
			this.$forceUpdate();
		});
	},
	async beforeUpdate() {
		if(this.$refs.terminal.scrollTop + this.$refs.terminal.clientHeight === this.$refs.terminal.scrollHeight) {
			await this.$nextTick();
			this.$refs.terminal.scrollTop = this.$refs.terminal.scrollHeight;
		}
	},
	methods: {
		fixInputSize() {
			const parent = this.$refs.input.parentElement;
			const location = parent.querySelector("span");

			this.$refs.input.style.width = `${(parent.getBoundingClientRect().width - parent.getBoundingClientRect().x) -
				(location.getBoundingClientRect().width - location.getBoundingClientRect().x) - 8}px`;
		},
		setFocus() {
			this.$refs.input.focus();
		},
		forceUpdate() {
			return this.$forceUpdate();
		},
		toLine(text) {
			return text.padEnd(text.length + (this.getCharacterCount() - (text.length % this.getCharacterCount())));
		},
		getCharacterCount() {
			const rect = this.$refs.terminal.getBoundingClientRect();
			return Math.floor((rect.width - rect.x) / (14 / 1.816));
		}
	}
};
</script>
