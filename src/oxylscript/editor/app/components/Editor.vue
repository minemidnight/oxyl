<template>
	<div class="container-fluid" style="height:calc(100vh - 3rem)">
		<codemirror ref="cm" :value="code" :options="options" @input="change" />
	</div>
</template>

<script>
import { codemirror } from "vue-codemirror";
import options from "../codemirror/options";

export default {
	data() {
		return {
			code: localStorage.code || "",
			options
		};
	},
	components: { codemirror },
	computed: {
		codemirror() {
			return this.$refs.cm.codemirror;
		}
	},
	async created() {
		await this.$nextTick();

		this.codemirror.setSize(null, "auto");
	},
	methods: {
		change(value) {
			localStorage.code = value;
		}
	}
};
</script>