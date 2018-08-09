<template>
	<div class="mb-2 clearfix">
		<select class="float-right" @input="update($event.target.value)">
			<option v-for="(display, value) in options" :key="value" :value="value" :selected="selected === display">{{ display }}</option>
		</select>
	</div>
</template>

<script>
export default {
	props: ["selected", "bind", "transform", "url"],
	data() {
		return {
			options: {
				180000: "30m",
				3600000: "1h",
				43200000: "12h",
				86400000: "24h",
				172800000: "2d",
				604800000: "1w",
				1209600000: "2w",
				2419200000: "1M"
			}
		};
	},
	methods: {
		async update(timespan) {
			const { body } = await apiCall.get(this.url)
				.query({ timespan });

			this.$set(this.bind.object, this.bind.key, this.transform(body));
		}
	}
};
</script>
