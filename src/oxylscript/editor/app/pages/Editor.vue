<template>
	<div>
		<div v-if="script" class="container-fluid">
			<div class="container-fluid control-bar">
				<router-link class="btn btn-secondary" v-scroll-reveal="{ delay: 250, origin: 'top' }" :to="{ name: 'dashboard' }">
					<i class="fa fa-arrow-left" aria-hidden="true"></i>
				</router-link>
				<button type="button" class="btn btn-danger" v-scroll-reveal="{ delay: 750, origin: 'top' }" @click="deleteScript()">
					<i class="fa fa-trash-o" aria-hidden="true"></i>
				</button>
				<div class="float-right d-flex align-items-center" v-if="saving.icon || saving.text">
					<span class="mr-2" v-if="saving.text" v-scroll-reveal.reset="{ origin: 'left' }" style="font-size:16px">{{ saving.text }}</span>
					<i v-if="saving.icon" style="font-size:30px" :class="{ fa: true, [`fa-${saving.icon}`]: true, 'fa-spin': saving.icon === 'spinner' }" aria-hidden="true" v-scroll-reveal.reset="{ origin: 'right' }"></i>
				</div>
			</div>
			<div class="mt-2" style="height:calc(100vh - 4.5rem);clear:both" v-scroll-reveal="{ delay: 1000 }">
				<codemirror ref="cm" :value="script.content" :options="options" @input="change" />
			</div>
		</div>
		<div v-else class="mt-4 loading">
			<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.loading {
	font-size: 48px;
	text-align: center;
}
</style>


<script>
import { codemirror } from "vue-codemirror";
import options from "../codemirror/options";

export default {
	components: { codemirror },
	data() {
		return {
			script: null,
			options,
			changeTimeout: null,
			saving: {
				icon: null,
				text: null
			}
		};
	},
	async created() {
		const { body: { script }, error } = await apiCall.get(`/scripts/${this.$route.params.id}`);

		if(error) this.$route.push({ name: "dashboard" });
		else this.script = script;

		await this.$nextTick();
		this.codemirror.setSize(null, "auto");
		this.codemirror.performLint();
		window.codemirror = this.codemirror;
	},
	computed: {
		codemirror() {
			return this.$refs.cm.codemirror;
		}
	},
	methods: {
		async change(value) {
			if(this.changeTimeout) clearTimeout(this.changeTimeout);

			this.saving.icon = "ellipsis-h";
			this.changeTimeout = setTimeout(async () => {
				if(document.querySelectorAll(".CodeMirror-lint-marker-error").length) {
					this.saving = {
						icon: "times",
						text: "Cannot save until errors are fixed"
					};
				} else {
					this.saving = {
						icon: "spinner",
						text: "Saving changes"
					};

					await apiCall.patch(`scripts/${this.script.id}`)
						.send({ content: value });

					this.saving = {
						icon: "check",
						text: "Changes saved"
					};
				}

				setTimeout(() => {
					this.saving = {
						icon: null,
						text: null
					};
				}, 2500);
			}, 2500);
		},
		async deleteScript() {
			await apiCall.delete(`scripts/${this.script.id}`);
			this.$router.push({ name: "dashboard" });
		}
	}
};
</script>
